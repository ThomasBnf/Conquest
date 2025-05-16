import { format, subDays } from "date-fns";
import { client } from "../client";

type AtRiskMember = {
  id: string;
  levelId: string | null;
  level: number;
  atRiskMember: number;
};

const AT_RISK_TAG_ID = "at-risk"; // À remplacer par l'ID réel du tag
const MIN_LEVEL_FOR_AT_RISK = 4;

export const getAtRiskMembers = async () => {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const from = format(thirtyDaysAgo, "yyyy-MM-dd HH:mm:ss");
  const to = format(now, "yyyy-MM-dd HH:mm:ss");

  const result = await client.query({
    query: `
      SELECT DISTINCT 
        m.id,
        m.levelId,
        l.number as level,
        m.atRiskMember
      FROM member m FINAL
      LEFT JOIN level l ON m.levelId = l.id
      WHERE 
        l.number >= ${MIN_LEVEL_FOR_AT_RISK}
        AND m.id NOT IN (
          SELECT memberId 
          FROM activity 
          WHERE 
            createdAt BETWEEN '${from}' AND '${to}'
        )
    `,
  });

  const { data } = await result.json();
  return data as AtRiskMember[];
};

export const getMembersToRemoveAtRiskTag = async () => {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const from = format(thirtyDaysAgo, "yyyy-MM-dd HH:mm:ss");
  const to = format(now, "yyyy-MM-dd HH:mm:ss");

  const result = await client.query({
    query: `
      SELECT DISTINCT m.id
      FROM member m FINAL
      LEFT JOIN level l ON m.levelId = l.id
      WHERE 
        m.atRiskMember = 1
        AND (
          l.number < ${MIN_LEVEL_FOR_AT_RISK}
          OR m.id IN (
            SELECT memberId 
            FROM activity 
            WHERE 
              createdAt BETWEEN '${from}' AND '${to}'
          )
        )
    `,
  });

  const { data } = await result.json();
  return data as Array<{ id: string }>;
};

export const getMembersWithoutAtRiskTag = async () => {
  const result = await client.query({
    query: `
      SELECT DISTINCT m.id
      FROM member m FINAL
      WHERE 
        m.atRiskMember = 1
        AND m.id NOT IN (
          SELECT memberId
          FROM member_tag
          WHERE tagId = '${AT_RISK_TAG_ID}'
        )
    `,
  });

  const { data } = await result.json();
  return data as Array<{ id: string }>;
};

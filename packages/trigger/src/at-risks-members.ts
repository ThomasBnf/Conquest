import { client } from "@conquest/clickhouse/client";
import { getMemberWithLevel } from "@conquest/clickhouse/member/getMemberWithLevel";
import { updateManyMembers } from "@conquest/clickhouse/member/updateManyMembers";
import { logger } from "@trigger.dev/sdk/v3";
import { format, subDays } from "date-fns";
import { triggerWorkflows } from "./tasks/triggerWorkflows";

export const atRisksMembers = async () => {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const from = format(thirtyDaysAgo, "yyyy-MM-dd HH:mm:ss");
  const to = format(now, "yyyy-MM-dd HH:mm:ss");

  await tagAtRiskMembers({ from, to });
  await removeTagAtRiskMembers({ from, to });
};

const tagAtRiskMembers = async ({ from, to }: { from: string; to: string }) => {
  const result = await client.query({
    query: `
      SELECT DISTINCT m.id as memberId
      FROM member m FINAL
      LEFT JOIN level l ON m.levelId = l.id
      WHERE 
        m.pulse >= 20
        AND m.atRiskMember = false
        AND m.id NOT IN (
          SELECT memberId 
          FROM activity 
          WHERE 
            createdAt BETWEEN '${from}' AND '${to}'
        )
    `,
  });

  const { data } = await result.json();
  const members = data as Array<{ memberId: string }>;

  logger.info("at-risks-members", {
    count: members.length,
    members,
  });

  const updatedMembers = [];

  for (const member of members) {
    const currentMember = await getMemberWithLevel({ id: member.memberId });

    if (!currentMember) continue;

    const updatedMember = {
      ...currentMember,
      atRiskMember: true,
    };

    updatedMembers.push(updatedMember);

    await triggerWorkflows.trigger({
      trigger: "at-risk-member",
      member: updatedMember,
    });
  }

  await updateManyMembers({ members: updatedMembers });
};

const removeTagAtRiskMembers = async ({
  from,
  to,
}: { from: string; to: string }) => {
  const result = await client.query({
    query: `
      SELECT DISTINCT m.id as memberId
      FROM member m FINAL
      LEFT JOIN level l ON m.levelId = l.id
      WHERE 
        m.pulse < 20
        AND m.atRiskMember = true
        AND m.id IN (
          SELECT memberId 
          FROM activity 
          WHERE 
            createdAt BETWEEN '${from}' AND '${to}'
        )
    `,
  });

  const { data } = await result.json();
  const members = data as Array<{ memberId: string }>;

  logger.info("remove-at-risks-members", {
    count: members.length,
    members,
  });

  const updatedMembers = [];

  for (const member of members) {
    const currentMember = await getMemberWithLevel({ id: member.memberId });

    if (!currentMember) continue;

    const updatedMember = {
      ...currentMember,
      atRisksMembers: false,
    };

    updatedMembers.push(updatedMember);
  }

  await updateManyMembers({ members: updatedMembers });
};

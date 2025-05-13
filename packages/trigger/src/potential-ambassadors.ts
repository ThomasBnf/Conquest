import { client } from "@conquest/clickhouse/client";
import { getMember } from "@conquest/clickhouse/members/getMember";
import { updateMember } from "@conquest/clickhouse/members/updateMember";
import { logger } from "@trigger.dev/sdk/v3";
import { format, subDays } from "date-fns";
import { triggerWorkflows } from "./tasks/triggerWorkflows";

export const potentialAmbassadors = async () => {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const from = format(thirtyDaysAgo, "yyyy-MM-dd HH:mm:ss");
  const to = format(now, "yyyy-MM-dd HH:mm:ss");

  await tagAmbassadors({ from, to });
  await removeAmbassadors({ from, to });
};

const tagAmbassadors = async ({ from, to }: { from: string; to: string }) => {
  const result = await client.query({
    query: `
      SELECT DISTINCT m.id as memberId
      FROM member m FINAL
      LEFT JOIN level l ON m.levelId = l.id
      WHERE 
        m.potentialAmbassador = 0
        AND l.number >= 7
        AND l.number <= 9
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

  logger.info("potential-ambassadors", {
    count: members.length,
    members,
  });

  for (const member of members) {
    const currentMember = await getMember({ id: member.memberId });

    if (!currentMember) continue;

    const updatedMember = {
      ...currentMember,
      potentialAmbassador: true,
    };

    await updateMember(updatedMember);

    await triggerWorkflows.trigger({
      trigger: "potential-ambassador",
      member: updatedMember,
    });
  }
};

const removeAmbassadors = async ({
  from,
  to,
}: { from: string; to: string }) => {
  const result = await client.query({
    query: `
      SELECT DISTINCT m.id as memberId
      FROM member m FINAL
      LEFT JOIN level l ON m.levelId = l.id
      WHERE 
        m.potentialAmbassador = 1
        AND l.number >= 7
        AND l.number <= 9
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

  logger.info("remove-potential-ambassadors", {
    count: members.length,
    members,
  });

  for (const member of members) {
    const currentMember = await getMember({ id: member.memberId });

    if (!currentMember) continue;

    const updatedMember = {
      ...currentMember,
      potentialAmbassador: false,
    };

    await updateMember(updatedMember);
  }
};

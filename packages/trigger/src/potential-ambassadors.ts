import { client } from "@conquest/clickhouse/client";
import { getMemberWithLevel } from "@conquest/clickhouse/member/getMemberWithLevel";
import { updateManyMembers } from "@conquest/clickhouse/member/updateManyMembers";
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
        m.potentialAmbassador = false
        AND m.pulse >= 150
        AND m.pulse <= 199
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

  const updatedMembers = [];

  for (const member of members) {
    const currentMember = await getMemberWithLevel({ id: member.memberId });

    if (!currentMember) continue;

    const updatedMember = {
      ...currentMember,
      potentialAmbassador: true,
    };

    updatedMembers.push(updatedMember);

    await triggerWorkflows.trigger({
      trigger: "potential-ambassador",
      member: updatedMember,
    });
  }

  await updateManyMembers({ members: updatedMembers });
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
        m.potentialAmbassador = true
        AND m.pulse >= 150
        AND m.pulse <= 199
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

  const updatedMembers = [];

  for (const member of members) {
    const currentMember = await getMemberWithLevel({ id: member.memberId });

    if (!currentMember) continue;

    const updatedMember = {
      ...currentMember,
      potentialAmbassador: false,
    };

    updatedMembers.push(updatedMember);
  }

  await updateManyMembers({ members: updatedMembers });
};

import { updateManyMembers } from "@conquest/db/member/updateManyMembers";
import { prisma } from "@conquest/db/prisma";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
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
  const members = await prisma.member.findMany({
    where: {
      pulse: {
        gte: 20,
      },
      isStaff: false,
      atRiskMember: false,
      activities: {
        some: {
          createdAt: {
            gte: from,
            lte: to,
          },
        },
      },
    },
  });

  const parsedMembers = MemberSchema.array().parse(members);

  logger.info("at-risks-members", {
    count: parsedMembers.length,
    members: parsedMembers,
  });

  const updatedMembers = [];

  for (const member of parsedMembers) {
    const updatedMember = {
      ...member,
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
  const members = await prisma.member.findMany({
    where: {
      pulse: {
        lt: 20,
      },
      atRiskMember: true,
      activities: {
        some: {
          createdAt: {
            gte: from,
            lte: to,
          },
        },
      },
    },
  });

  const parsedMembers = MemberSchema.array().parse(members);

  logger.info("remove-at-risks-members", {
    count: members.length,
    members,
  });

  const updatedMembers = [];

  for (const member of parsedMembers) {
    const updatedMember = {
      ...member,
      atRiskMember: false,
    };

    updatedMembers.push(updatedMember);
  }

  await updateManyMembers({ members: updatedMembers });
};

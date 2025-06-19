import { updateManyMembers } from "@conquest/db/member/updateManyMembers";
import { prisma } from "@conquest/db/prisma";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
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
  const members = await prisma.member.findMany({
    where: {
      pulse: {
        gte: 150,
        lte: 199,
      },
      isStaff: false,
      potentialAmbassador: false,
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

  logger.info("potential-ambassadors", {
    count: members.length,
    members,
  });

  const updatedMembers = [];

  for (const member of parsedMembers) {
    const updatedMember = {
      ...member,
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
  const members = await prisma.member.findMany({
    where: {
      pulse: {
        gte: 150,
        lte: 199,
      },
      isStaff: false,
      potentialAmbassador: true,
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

  logger.info("remove-potential-ambassadors", {
    count: members.length,
    members,
  });

  const updatedMembers = [];

  for (const member of parsedMembers) {
    const updatedMember = {
      ...member,
      potentialAmbassador: false,
    };

    updatedMembers.push(updatedMember);
  }

  await updateManyMembers({ members: updatedMembers });
};

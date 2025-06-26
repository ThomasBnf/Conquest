import { updateManyMembers } from "@conquest/db/member/updateManyMembers";
import { prisma } from "@conquest/db/prisma";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { logger } from "@trigger.dev/sdk/v3";
import { format, subDays } from "date-fns";
import { triggerWorkflows } from "./tasks/triggerWorkflows";

export const potentialAmbassadors = async () => {
  const now = new Date();
  const from = subDays(now, 30);

  await tagAmbassadors({ from, to: now });
  await removeAmbassadors({ from, to: now });
};

const tagAmbassadors = async ({ from, to }: { from: Date; to: Date }) => {
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

const removeAmbassadors = async ({ from, to }: { from: Date; to: Date }) => {
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

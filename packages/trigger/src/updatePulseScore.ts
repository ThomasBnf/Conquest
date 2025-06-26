import { prisma } from "@conquest/db/prisma";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { logger } from "@trigger.dev/sdk/v3";
import { endOfHour, startOfHour, subHours } from "date-fns";
import { getPulseAndLevel } from "@conquest/db/member/getPulseAndLevel";

export const updatePulseScore = async () => {
  const now = new Date();
  const start = startOfHour(subHours(now, 1));
  const end = endOfHour(subHours(now, 1));

  const members = await prisma.member.findMany({
    where: {
      activities: {
        some: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      },
    },
  });

  const parsedMembers = MemberSchema.array().parse(members);

  for (const member of parsedMembers) {
    logger.info("member", { member });
    await getPulseAndLevel({ memberId: member.id });
  }
};

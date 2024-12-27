import { prisma } from "@/lib/prisma";
import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { endOfDay, startOfDay, subDays } from "date-fns";

type Props = {
  member: Member;
};

export const listActivitiesIn365Days = async ({ member }: Props) => {
  const today = new Date();
  const last365Days = startOfDay(subDays(today, 365));

  const activities = await prisma.activities.findMany({
    where: {
      member_id: member.id,
      created_at: {
        gte: last365Days,
        lte: endOfDay(today),
      },
      activity_type: {
        weight: {
          gt: 0,
        },
      },
    },
    include: {
      activity_type: true,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  return ActivityWithTypeSchema.array().parse(activities);
};

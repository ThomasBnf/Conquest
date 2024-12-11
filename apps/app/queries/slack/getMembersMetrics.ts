import { prisma } from "@/lib/prisma";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { isAfter, startOfMonth, subMonths } from "date-fns";
import { getMemberPresence } from "./getMemberPresence";

type Props = {
  members: Member[];
};

export const getMembersMetrics = async ({ members }: Props) => {
  const last3months = startOfMonth(subMonths(new Date(), 3));

  for (const member of members) {
    const activities = await prisma.activities.findMany({
      where: {
        member_id: member.id,
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

    const last3monthsActivities = activities.filter((activity) =>
      isAfter(activity.created_at, last3months),
    );

    const love = last3monthsActivities.reduce(
      (acc, activity) => acc + activity.activity_type.weight,
      0,
    );
    const maxWeight = Math.max(
      ...last3monthsActivities.map((activity) => activity.activity_type.weight),
      0,
    );

    const presence = getMemberPresence(last3monthsActivities);
    const level = presence > maxWeight ? presence : maxWeight;

    await prisma.members.update({
      where: { id: member.id },
      data: {
        love,
        presence,
        level,
        first_activity: activities[0]?.created_at,
        last_activity: activities.at(-1)?.created_at,
      },
    });
  }
};

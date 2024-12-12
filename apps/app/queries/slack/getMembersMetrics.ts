import { prisma } from "@/lib/prisma";
import type { Member } from "@conquest/zod/schemas/member.schema";
import {
  addWeeks,
  isAfter,
  isBefore,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
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

    const love_logs = [];
    const presence_logs = [];
    const level_logs = [];

    if (activities.length > 0) {
      const firstActivity = activities.at(0)?.created_at;
      if (!firstActivity) continue;

      let currentWeekStart = startOfWeek(firstActivity);
      const lastActivityDate = activities.at(-1)?.created_at || new Date();

      while (isBefore(currentWeekStart, lastActivityDate)) {
        const nextWeekStart = addWeeks(currentWeekStart, 1);

        const weekActivities = activities.filter(
          (activity) =>
            isAfter(activity.created_at, currentWeekStart) &&
            isBefore(activity.created_at, nextWeekStart),
        );

        const weekLove = weekActivities.reduce(
          (acc, activity) => acc + activity.activity_type.weight,
          0,
        );

        const weekMaxWeight = Math.max(
          ...weekActivities.map((activity) => activity.activity_type.weight),
          0,
        );

        const weekPresence = getMemberPresence(weekActivities);
        const weekLevel =
          weekPresence > weekMaxWeight ? weekPresence : weekMaxWeight;

        love_logs.push({
          date: currentWeekStart,
          value: weekLove,
        });

        presence_logs.push({
          date: currentWeekStart,
          value: weekPresence,
        });

        level_logs.push({
          date: currentWeekStart,
          value: weekLevel,
        });

        currentWeekStart = nextWeekStart;
      }
    }

    await prisma.members.update({
      where: { id: member.id },
      data: {
        love,
        presence,
        level,
        first_activity: activities[0]?.created_at,
        last_activity: activities.at(-1)?.created_at,
        love_logs,
        presence_logs,
        level_logs,
      },
    });
  }
};

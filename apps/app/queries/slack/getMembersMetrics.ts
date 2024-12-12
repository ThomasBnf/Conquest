import { prisma } from "@/lib/prisma";
import type { Member } from "@conquest/zod/schemas/member.schema";
import {
  eachWeekOfInterval,
  isAfter,
  isSameWeek,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { getMemberPresence } from "./getMemberPresence";

type Props = {
  members: Member[];
};

export const getMembersMetrics = async ({ members }: Props) => {
  const today = new Date();
  const last3months = startOfMonth(subMonths(today, 3));
  const last365Days = subDays(today, 365);
  const currentWeek = startOfWeek(today);

  for (const member of members) {
    const activities = await prisma.activities.findMany({
      where: {
        member_id: member.id,
        created_at: {
          gte: last365Days,
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

    if (!activities.length) {
      await prisma.members.update({
        where: { id: member.id },
        data: {
          love: 0,
          presence: 0,
          level: 0,
          love_logs: [],
          presence_logs: [],
          level_logs: [],
        },
      });
      continue;
    }

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

    const presence = getMemberPresence(activities, currentWeek);
    const level = Math.max(presence, maxWeight);

    const weekIntervals = eachWeekOfInterval({
      start: last365Days,
      end: today,
    });

    const logs = weekIntervals.map((weekStart) => {
      const activitiesUntilWeek = activities.filter(
        (activity) => activity.created_at <= weekStart,
      );

      const weekLast3months = startOfMonth(subMonths(weekStart, 3));

      const weekLast3monthsActivities = activitiesUntilWeek.filter((activity) =>
        isAfter(activity.created_at, weekLast3months),
      );

      const weekLove = weekLast3monthsActivities.reduce(
        (acc, activity) => acc + activity.activity_type.weight,
        0,
      );

      const weekMaxWeight = Math.max(
        ...weekLast3monthsActivities.map(
          (activity) => activity.activity_type.weight,
        ),
        0,
      );

      const weekPresence = getMemberPresence(activitiesUntilWeek, weekStart);
      const weekLevel = Math.max(weekPresence, weekMaxWeight);

      return {
        date: weekStart,
        love: weekLove,
        presence: weekPresence,
        level: weekLevel,
      };
    });

    await prisma.members.update({
      where: { id: member.id },
      data: {
        love,
        presence,
        level,
        first_activity: activities.at(0)?.created_at,
        last_activity: activities.at(-1)?.created_at,
        love_logs: logs.map(({ date, love }) => ({ date, value: love })),
        presence_logs: logs.map(({ date, presence }) => ({
          date,
          value: presence,
        })),
        level_logs: logs.map(({ date, level }) => ({ date, value: level })),
      },
    });
  }
};

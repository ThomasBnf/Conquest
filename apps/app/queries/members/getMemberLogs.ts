import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import {
  eachWeekOfInterval,
  isAfter,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { getMemberPresence } from "../slack/getMemberPresence";

type Props = {
  memberId: string;
  activities: ActivityWithType[];
};

export const getMemberLogs = async ({ memberId, activities }: Props) => {
  const today = new Date();
  const last365Days = subDays(today, 365);

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

  return logs;
};

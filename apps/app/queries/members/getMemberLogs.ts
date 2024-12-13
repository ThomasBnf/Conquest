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
  activities: ActivityWithType[];
};

export const getMemberLogs = async ({ activities }: Props) => {
  const today = new Date();
  const last365Days = subDays(today, 365);

  const weekIntervals = eachWeekOfInterval(
    {
      start: last365Days,
      end: today,
    },
    { weekStartsOn: 1 },
  );

  const logs = weekIntervals.map((weekStart) => {
    const weekLast3months = startOfMonth(subMonths(weekStart, 3));
    const activitiesUntilWeek = activities.filter(
      (activity) =>
        activity.created_at <= weekStart &&
        isAfter(activity.created_at, weekLast3months),
    );

    const weekLove = activitiesUntilWeek.reduce(
      (acc, activity) => acc + activity.activity_type.weight,
      0,
    );

    const getHighestWeightActivity = (activities: ActivityWithType[]) => {
      if (!activities.length) return null;

      return activities.reduce((highest, current) =>
        current.activity_type.weight > (highest?.activity_type.weight ?? 0)
          ? current
          : highest,
      );
    };

    const weekMaxWeightActivity = getHighestWeightActivity(activitiesUntilWeek);
    const { source, name, weight } = weekMaxWeightActivity?.activity_type ?? {};
    const maxWeight = weight ?? 0;

    const maxWeightActivityString = weekMaxWeightActivity
      ? `${source?.slice(0, 1).toUpperCase()}${source?.slice(1).toLowerCase()} - ${name}`
      : "No activity";

    const weekPresence = getMemberPresence(activitiesUntilWeek, weekStart);
    const weekLevel = Math.max(weekPresence, maxWeight);

    return {
      date: weekStart,
      love: weekLove,
      presence: weekPresence,
      level: weekLevel,
      max_weight: maxWeight,
      max_weight_activity: maxWeightActivityString,
    };
  });

  return logs;
};

import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import {
  endOfWeek,
  isAfter,
  isBefore,
  startOfDay,
  subMonths,
  subWeeks,
} from "date-fns";
import { getMemberPresence } from "./getMemberPresence";

type Props = {
  activities: ActivityWithType[];
  today: Date;
};

export const getMemberMetrics = async ({ activities, today }: Props) => {
  const last3months = startOfDay(subMonths(today, 3));
  const previousWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

  const last3monthsActivities = activities.filter(
    (activity) =>
      isBefore(activity.created_at, previousWeekEnd) &&
      isAfter(activity.created_at, last3months),
  );

  const pulse = last3monthsActivities.reduce(
    (acc, activity) => acc + activity.activity_type.weight,
    0,
  );

  const maxWeight = Math.max(
    ...last3monthsActivities.map((activity) => activity.activity_type.weight),
    0,
  );

  const getMaxWeightActivity = (activities: ActivityWithType[]) => {
    if (!activities.length) return null;

    return activities.reduce((activity, current) =>
      current.activity_type.weight > activity?.activity_type.weight
        ? current
        : activity,
    );
  };

  const maxActivity = getMaxWeightActivity(last3monthsActivities);
  const { source, name } = maxActivity?.activity_type ?? {};
  const maxWeightActivity = maxActivity
    ? `${source?.slice(0, 1).toUpperCase()}${source?.slice(1).toLowerCase()} - ${name}`
    : "No activity";

  const presence = getMemberPresence(activities, today);
  const level = maxWeight > presence ? maxWeight : presence;

  return {
    pulse,
    presence,
    level,
    max_weight: maxWeight,
    max_weight_activity: maxWeightActivity,
  };
};

import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";

type Props = {
  activities: ActivityWithType[] | undefined;
};

export const getPulseScore = ({ activities }: Props): number => {
  if (!activities) return 0;

  const groupedActivities = activities.reduce<
    Record<string, { count: number; points: number }>
  >((acc, activity) => {
    const { activity_type, channel_id } = activity;
    const { key, points, conditions } = activity_type;

    const activityKey =
      conditions?.rules?.length > 0 ? `${key}-${channel_id}` : key;

    const activityPoints =
      conditions?.rules?.length > 0
        ? (conditions.rules.find((rule) => rule.channel_id === channel_id)
            ?.points ?? points)
        : points;

    if (!acc[activityKey]) {
      acc[activityKey] = {
        count: 0,
        points: activityPoints,
      };
    }

    acc[activityKey].count += 1;
    return acc;
  }, {});

  return Object.values(groupedActivities).reduce(
    (total, { count, points }) => total + count * points,
    0,
  );
};

import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";

type Props = {
  activities: ActivityWithType[] | undefined;
};

export const getPulseScore = ({ activities }: Props): number => {
  if (!activities) return 0;

  const groupedActivities = activities.reduce<
    Record<string, { count: number; points: number }>
  >((acc, activity) => {
    const { activity_type } = activity;
    const { key, points } = activity_type;

    if (!acc[key]) {
      acc[key] = {
        count: 0,
        points,
      };
    }

    acc[key].count += 1;
    return acc;
  }, {});

  return Object.values(groupedActivities).reduce(
    (total, { count, points }) => total + count * points,
    0,
  );
};

import { ActivityTypeRuleSchema } from "@conquest/zod/schemas/activity-type.schema";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import type { Channel } from "@conquest/zod/schemas/channel.schema";

type Props = {
  activities: ActivityWithType[] | undefined;
  channels: Channel[] | undefined;
};

type ScoreGroup = {
  count: number;
  points: number;
  activities: string[];
  conditions?: Record<
    string,
    {
      count: number;
      points: number;
    }
  >;
};

export const getPulseScoreDetails = ({ activities, channels }: Props) => {
  if (!activities || !channels) return {};

  return activities
    .sort(
      (a, b) => (b.activity_type.points ?? 0) - (a.activity_type.points ?? 0),
    )
    .reduce<Record<string, Record<string, ScoreGroup>>>((acc, activity) => {
      const { activity_type } = activity;
      const { source, name, points } = activity_type;

      const parsedConditions = ActivityTypeRuleSchema.array().parse(
        activity_type.conditions.rules,
      );
      const condition = parsedConditions.find(
        (condition) => condition.channel_id === activity.channel_id,
      );

      if (!acc[source]) acc[source] = {};
      if (!acc[source][name]) {
        acc[source][name] = {
          count: 0,
          points,
          conditions: {},
          activities: [],
        };
      }

      if (!condition) {
        acc[source][name].count += 1;
        acc[source][name].activities.push(activity.id);
      }

      if (condition) {
        const { points: conditionPoints } = condition;
        const conditionKey = channels?.find(
          (channel) => channel.id === condition.channel_id,
        )?.name;

        if (!conditionKey) return acc;
        if (!acc[source][name].conditions![conditionKey]) {
          acc[source][name].conditions![conditionKey] = {
            count: 0,
            points: conditionPoints,
          };
        }
        acc[source][name].conditions![conditionKey].count += 1;
      }

      return acc;
    }, {});
};

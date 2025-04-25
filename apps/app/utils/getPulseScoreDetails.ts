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
  activities: ActivityWithType[];
  hasChannel: boolean;
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
    .sort((a, b) => (b.activityType.points ?? 0) - (a.activityType.points ?? 0))
    .reduce<Record<string, Record<string, ScoreGroup>>>((acc, activity) => {
      const { activityType } = activity;
      const { source, name, points } = activityType;

      const parsedConditions = ActivityTypeRuleSchema.array().parse(
        activityType.conditions.rules,
      );
      const condition = parsedConditions.find(
        (condition) => condition.channelId === activity.channelId,
      );

      if (!acc[source]) acc[source] = {};
      if (!acc[source][name]) {
        acc[source][name] = {
          count: 0,
          points,
          hasChannel: ["Slack", "Discord", "Discourse"].includes(source),
          conditions: {},
          activities: [],
        };
      }

      if (!condition) {
        acc[source][name].count += 1;
        acc[source][name].activities.push(activity);
      }

      if (condition) {
        const { points } = condition;
        const conditionKey = channels?.find(
          (channel) => channel.id === condition.channelId,
        )?.name;

        if (!conditionKey) return acc;
        if (!acc[source][name].conditions![conditionKey]) {
          acc[source][name].conditions![conditionKey] = {
            count: 0,
            points,
          };
        }
        acc[source][name].conditions![conditionKey].count += 1;
      }

      return acc;
    }, {});
};

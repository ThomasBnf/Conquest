import { trpc } from "@/server/client";
import type {
  ActivityType,
  ActivityTypeRule,
} from "@conquest/zod/schemas/activity-type.schema";

type Props = {
  activityType: ActivityType;
  condition: ActivityTypeRule;
};

export const ConditionCard = ({ activityType, condition }: Props) => {
  const { channelId, points } = condition;
  const { data: channels } = trpc.channels.list.useQuery({});

  const channel = channels?.find((c) => c.id === channelId);
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <p>
        If{" "}
        <span className="font-medium text-foreground lowercase">
          {activityType.name}
        </span>
      </p>
      <p>{`in #${channel?.name}`}</p>
      <p className="font-medium text-foreground">
        {points} {points > 1 ? "points" : "point"}
      </p>
    </div>
  );
};

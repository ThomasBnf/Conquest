import type { ActivityWithTypeAndMember } from "@conquest/zod/schemas/activity.schema";
import { ActivityCard } from "../activity-card";
import { Message } from "../message";
import { LivestormBadge } from "./livestorm-badge";

type Props = {
  activity: ActivityWithTypeAndMember;
};

export const LivestormActivity = ({ activity }: Props) => {
  const { name } = activity.activity_type;

  return (
    <ActivityCard
      activity={activity}
      badge={<LivestormBadge label={name} />}
      className="from-livestorm"
    >
      <Message activity={activity} />
    </ActivityCard>
  );
};

import type { ActivityWithTypeAndMember } from "@conquest/zod/schemas/activity.schema";
import { ActivityCard } from "../activity-card";
import { Message } from "../message";
import { DiscordBadge } from "./discord-badge";

type Props = {
  activity: ActivityWithTypeAndMember;
};

export const DiscordActivity = ({ activity }: Props) => {
  const { name } = activity.activity_type;

  return (
    <ActivityCard
      activity={activity}
      badge={<DiscordBadge label={name} />}
      className="from-discord"
    >
      <Message activity={activity} />
    </ActivityCard>
  );
};

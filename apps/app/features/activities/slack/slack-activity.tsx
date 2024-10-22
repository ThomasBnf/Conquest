import type { ActivityWithMember } from "@conquest/zod/activity.schema";
import { ActivityCard } from "../activity-card";
import { Message } from "../message";
import { SlackBadge } from "./slack-badge";

type Props = {
  activity: ActivityWithMember;
};

export const SlackActivity = ({ activity }: Props) => {
  const { type } = activity.details;

  return (
    <ActivityCard activity={activity} badge={<SlackBadge label={type} />}>
      <Message activity={activity} />
    </ActivityCard>
  );
};

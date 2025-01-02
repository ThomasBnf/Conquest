import type { ActivityWithTypeAndMember } from "@conquest/zod/activity.schema";
import { ActivityCard } from "../activity-card";
import { Message } from "../message";
import { LinkedinBadge } from "./linkedin-badge";

type Props = {
  activity: ActivityWithTypeAndMember;
};

export const LinkedinActivity = ({ activity }: Props) => {
  const { name } = activity.activity_type;

  return (
    <ActivityCard
      activity={activity}
      badge={<LinkedinBadge label={name} />}
      className="from-linkedin"
    >
      <Message activity={activity} />
    </ActivityCard>
  );
};

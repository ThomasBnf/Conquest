import type { ActivityWithTypeAndMember } from "@conquest/zod/schemas/activity.schema";
import { ActivityCard } from "../activity-card";
import { Message } from "../message";
import { DiscourseBadge } from "./discourse-badge";

type Props = {
  activity: ActivityWithTypeAndMember;
};

export const DiscourseActivity = ({ activity }: Props) => {
  const { name } = activity.activity_type;

  return (
    <ActivityCard
      activity={activity}
      badge={<DiscourseBadge label={name} />}
      className="from-discourse"
    >
      <Message activity={activity} />
    </ActivityCard>
  );
};

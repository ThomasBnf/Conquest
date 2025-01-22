import type { ActivityWithTypeAndMember } from "@conquest/zod/schemas/activity.schema";
import { ActivityCard } from "../activity-card";
import { Message } from "../message";
import { ManualBadge } from "./manual-badge";

type Props = {
  activity: ActivityWithTypeAndMember;
};

export const ManualActivity = ({ activity }: Props) => {
  const { name } = activity.activity_type;

  return (
    <ActivityCard
      activity={activity}
      badge={<ManualBadge label={name} />}
      className="from-main-500"
    >
      <Message activity={activity} />
    </ActivityCard>
  );
};

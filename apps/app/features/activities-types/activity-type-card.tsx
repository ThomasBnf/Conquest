import { SourceBadge } from "@/components/badges/source-badge";
import type { ActivityType as _ActivityType } from "@conquest/zod/schemas/activity-type.schema";
import { ActivityTypeMenu } from "./activity-type-menu";

type Props = {
  activityType: _ActivityType;
};

export const ActivityType = ({ activityType }: Props) => {
  return (
    <div className="flex items-center gap-4">
      <p className="w-52 truncate font-medium">{activityType.name}</p>
      <div className="w-32">
        <SourceBadge source={activityType.source} />
      </div>
      <p className="flex-1 truncate text-muted-foreground">
        {activityType.key}
      </p>
      <p className="w-24 font-mono">{activityType.weight}</p>
      <ActivityTypeMenu activityType={activityType} />
    </div>
  );
};

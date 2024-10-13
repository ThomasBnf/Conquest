import { formatDistanceStrict } from "date-fns";
import type { Activity } from "schemas/activity.schema";

type Props = {
  activity: Activity;
};

export const CreatedAt = ({ activity }: Props) => {
  return (
    <p className="shrink-0 text-xs text-muted-foreground">
      {formatDistanceStrict(activity.created_at, new Date(), {
        addSuffix: true,
      })}
    </p>
  );
};

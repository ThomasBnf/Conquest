import type { Activity } from "@conquest/zod/activity.schema";
import { formatDistanceStrict } from "date-fns";

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

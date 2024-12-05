import type { Activity } from "@conquest/zod/activity.schema";
import { formatDistanceStrict } from "date-fns";

type Props = {
  activity: Activity;
};

export const CreatedAt = ({ activity }: Props) => {
  return (
    <p className="shrink-0 text-muted-foreground text-xs">
      {formatDistanceStrict(activity.created_at, new Date(), {
        addSuffix: true,
      })}
    </p>
  );
};

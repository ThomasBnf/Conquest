import { getActivity } from "@/client/activities/getActivity";
import { Skeleton } from "@conquest/ui/skeleton";
import type { ActivityWithMember } from "@conquest/zod/schemas/activity.schema";
import { Info } from "lucide-react";
import { ActivityCard } from "../activity-card";
import { Markdown } from "../markdown";

type Props = {
  activity: ActivityWithMember;
};

export const DiscordReply = ({ activity }: Props) => {
  const { reply_to } = activity;
  const { data, isLoading } = getActivity({ id: reply_to });

  if (isLoading) {
    return (
      <div className="h-16 w-full rounded-md border p-3">
        <Skeleton className="h-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-muted p-2">
        <Info className="size-4" />
        <p>Post not available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ActivityCard activity={data}>
        {data.title ? (
          <div>
            <p className="font-medium">{data.title}</p>
            <Markdown activity={data} className="text-muted-foreground" />
          </div>
        ) : (
          <Markdown activity={data} />
        )}
      </ActivityCard>
      <Markdown activity={activity} />
    </div>
  );
};

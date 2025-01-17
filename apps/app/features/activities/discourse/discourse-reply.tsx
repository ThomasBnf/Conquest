import { getDiscourseReply } from "@/client/discourse/getDiscourseReply";
import { Skeleton } from "@conquest/ui/skeleton";
import type { ActivityWithMember } from "@conquest/zod/schemas/activity.schema";
import { Info } from "lucide-react";
import { ActivityCard } from "../activity-card";
import { Markdown } from "../markdown";

type Props = {
  activity: ActivityWithMember;
};

export const DiscourseReply = ({ activity }: Props) => {
  const { reply_to, thread_id } = activity;
  const { data, isLoading } = getDiscourseReply({ reply_to, thread_id });

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
        <Info className="size-4" /> <p>Post not available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ActivityCard activity={data}>
        <Markdown activity={data} />
      </ActivityCard>
      <Markdown activity={activity} />
    </div>
  );
};

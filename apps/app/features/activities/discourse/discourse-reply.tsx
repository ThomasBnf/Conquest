import { getDiscourseReply } from "@/client/discourse/getDiscourseReply";
import { Skeleton } from "@conquest/ui/skeleton";
import type { ActivityWithMember } from "@conquest/zod/schemas/activity.schema";
import { ActivityCard } from "../activity-card";
import { Markdown } from "../markdown";

type Props = {
  activity: ActivityWithMember;
};

export const DiscourseReply = ({ activity }: Props) => {
  const { reply_to, thread_id } = activity;
  const { data } = getDiscourseReply({ reply_to, thread_id });

  if (!data)
    return (
      <div className="h-16 w-full rounded-md border p-3">
        <Skeleton className="h-full" />
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <ActivityCard activity={data}>
        <Markdown activity={data} />
      </ActivityCard>
      <Markdown activity={activity} />
    </div>
  );
};

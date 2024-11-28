import { SlackMarkdown } from "@/features/activities/components/slack/slack-markdown";
import { Skeleton } from "@conquest/ui/skeleton";
import type { ActivityWithMember } from "@conquest/zod/activity.schema";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { ActivityCard } from "../activity-card";

type Props = {
  activity: ActivityWithMember;
};

export const SlackReply = ({ activity }: Props) => {
  const { reply_to } = activity;

  const { data } = useQuery({
    queryKey: ["reply_to", reply_to],
    queryFn: async () =>
      await ky.get(`/api/activities/${reply_to}`).json<ActivityWithMember>(),
  });

  if (!data)
    return (
      <div className="h-16 w-full rounded-md border p-3">
        <Skeleton className="h-full" />
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <ActivityCard activity={data}>
        <SlackMarkdown activity={data} />
      </ActivityCard>
      <SlackMarkdown activity={activity} />
    </div>
  );
};

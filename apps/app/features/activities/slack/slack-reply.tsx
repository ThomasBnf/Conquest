import { SlackMarkdown } from "@/features/activities/slack/slack-markdown";
import { client } from "@/lib/rpc";
import { Skeleton } from "@conquest/ui/skeleton";
import {
  type ActivityWithMember,
  ActivityWithMemberSchema,
  ActivityWithTypeAndMemberSchema,
} from "@conquest/zod/activity.schema";
import { useQuery } from "@tanstack/react-query";
import { ActivityCard } from "../activity-card";

type Props = {
  activity: ActivityWithMember;
};

export const SlackReply = ({ activity }: Props) => {
  const { reply_to } = activity;

  const { data } = useQuery({
    queryKey: ["reply_to", reply_to],
    queryFn: async () => {
      if (!reply_to) return null;
      const response = await client.api.activities[":activityId"].$get({
        param: {
          activityId: reply_to,
        },
      });

      return ActivityWithMemberSchema.parse(await response.json());
    },
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

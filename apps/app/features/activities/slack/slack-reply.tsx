import { SlackMarkdown } from "@/helpers/slack-markdown";
import { Skeleton } from "@conquest/ui/skeleton";
import {
  ActivitySlackSchema,
  type ActivityWithMember,
} from "@conquest/zod/activity.schema";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { ActivityCard } from "../activity-card";

type Props = {
  activity: ActivityWithMember;
};

export const SlackReply = ({ activity }: Props) => {
  const slackActivity = ActivitySlackSchema.parse(activity.details);

  const { data } = useQuery({
    queryKey: ["activities", slackActivity.reply_to],
    queryFn: async () =>
      (await ky
        .get(`/api/activities/${slackActivity.reply_to}`)
        .json()) as ActivityWithMember,
  });

  if (!data)
    return (
      <div className="h-16 w-full border rounded-lg p-3">
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

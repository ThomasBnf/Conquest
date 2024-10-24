import { SlackMarkdown } from "@/helpers/slack-markdown";
import { Skeleton } from "@conquest/ui/skeleton";
import {
  ActivitySlackSchema,
  type ActivityWithMember,
} from "@conquest/zod/activity.schema";
import ky from "ky";
import useSWR from "swr";
import { ActivityCard } from "../activity-card";

type Props = {
  activity: ActivityWithMember;
};

export const SlackReply = ({ activity }: Props) => {
  const slackActivity = ActivitySlackSchema.parse(activity.details);

  const { data, isLoading } = useSWR(
    `/api/activities/${slackActivity.reply_to}`,
    async (url) => (await ky.get(url).json()) as ActivityWithMember,
  );

  if (!data)
    return (
      <div className="h-16 w-full border rounded p-3">
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

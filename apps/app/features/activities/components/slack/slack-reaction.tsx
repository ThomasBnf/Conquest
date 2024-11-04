import { SlackMarkdown } from "@/features/activities/components/slack/slack-markdown";
import { emojiParser } from "@/features/activities/helpers/emoji-parser";
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

export const SlackReaction = ({ activity }: Props) => {
  const slackActivity = ActivitySlackSchema.parse(activity.details);

  const { data } = useQuery({
    queryKey: ["react_to", slackActivity.react_to],
    queryFn: async () =>
      await ky
        .get(`/api/activities/${slackActivity.react_to}`)
        .json<ActivityWithMember>(),
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
      <p className="border border-[#1264a3] size-7 rounded-lg bg-[#e3f8ff] text-center place-content-center">
        {emojiParser(slackActivity.message)}
      </p>
    </div>
  );
};

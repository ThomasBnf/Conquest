import { emojiParser } from "@/features/activities/helpers/emoji-parser";
import { SlackMarkdown } from "@/features/activities/slack/slack-markdown";
import { useGetActivity } from "@/queries/hooks/useGetActivity";
import { Skeleton } from "@conquest/ui/skeleton";
import type { ActivityWithMember } from "@conquest/zod/activity.schema";
import { ActivityCard } from "../activity-card";

type Props = {
  activity: ActivityWithMember;
};

export const SlackReaction = ({ activity }: Props) => {
  const { react_to } = activity;
  const { data } = useGetActivity({ id: react_to });

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
      <p className="size-7 place-content-center rounded-md border border-[#1264a3] bg-[#e3f8ff] text-center">
        {emojiParser(activity.message)}
      </p>
    </div>
  );
};

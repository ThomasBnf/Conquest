import { getActivity } from "@/client/activities/getActivity";
import { emojiParser } from "@/features/activities/helpers/emoji-parser";
import { Skeleton } from "@conquest/ui/skeleton";
import type { ActivityWithMember } from "@conquest/zod/schemas/activity.schema";
import { ActivityCard } from "../activity-card";
import { Markdown } from "../markdown";

type Props = {
  activity: ActivityWithMember;
};

export const SlackReaction = ({ activity }: Props) => {
  const { react_to } = activity;
  const { data, isLoading } = getActivity({ id: react_to });

  if (isLoading)
    return (
      <div className="h-16 w-full rounded-md border p-3">
        <Skeleton className="h-full" />
      </div>
    );

  if (!data) return <p>Post not available</p>;

  return (
    <div className="flex flex-col gap-2">
      <ActivityCard activity={data}>
        <Markdown activity={data} />
      </ActivityCard>
      <p className="size-7 place-content-center rounded-md border border-[#1264a3] bg-[#e3f8ff] text-center">
        {emojiParser(activity.message)}
      </p>
    </div>
  );
};

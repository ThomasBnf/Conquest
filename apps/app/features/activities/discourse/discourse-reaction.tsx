import { getActivity } from "@/client/activities/getActivity";
import { Skeleton } from "@conquest/ui/skeleton";
import type { ActivityWithMember } from "@conquest/zod/schemas/activity.schema";
import { Info } from "lucide-react";
import { ActivityCard } from "../activity-card";
import { Markdown } from "../markdown";

type Props = {
  activity: ActivityWithMember;
};

export const DiscourseReaction = ({ activity }: Props) => {
  const { react_to, message } = activity;
  const { data, isLoading } = getActivity({ id: react_to });

  if (isLoading) {
    return (
      <div className="h-16 w-full rounded-md border p-3">
        <Skeleton className="h-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {data ? (
        <ActivityCard activity={data}>
          <Markdown activity={data} />
        </ActivityCard>
      ) : (
        <div className="flex items-center gap-2 rounded-md border bg-muted p-2">
          <Info className="size-4" />
          <p>Post not available</p>
        </div>
      )}
      <p className="size-7 place-content-center rounded-md border border-[#1264a3] bg-[#e3f8ff] text-center">
        {message === "like" && <p>❤️</p>}
        {message === "pray" && <p>🙏</p>}
        {message === "bulb" && <p>💡</p>}
        {message === "clap" && <p>👏</p>}
        {message === "laugh" && <p>😂</p>}
      </p>
    </div>
  );
};

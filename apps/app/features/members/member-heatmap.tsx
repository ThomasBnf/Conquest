"use client";

import { Heatmap } from "@/components/custom/heatmap";
import { IconDoc } from "@/components/custom/icon-doc";
import { trpc } from "@/server/client";
import { Skeleton } from "@conquest/ui/skeleton";

type Props = {
  memberId: string;
};

export const MemberHeatmap = ({ memberId }: Props) => {
  const { data, isLoading } = trpc.dashboard.heatmap.useQuery({
    member_id: memberId,
  });

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <p className="font-medium text-lg">Member Heatmap</p>
        <IconDoc url="https://docs.useconquest.com/member-heatmap" />
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        {isLoading ? <Skeleton className="h-4 w-6" /> : <p>{data?.length}</p>}
        <p>
          {data?.length === 1 ? "activity" : "activities"} in the last 365 days
        </p>
      </div>
      <Heatmap activities={data} member_id={memberId} />
    </div>
  );
};

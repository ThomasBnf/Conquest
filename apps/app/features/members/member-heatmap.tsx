"use client";

import { IconDoc } from "@/components/custom/icon-doc";

type Props = {
  memberId: string;
};

export const MemberHeatmap = ({ memberId }: Props) => {
  // const { data, isLoading } = trpc.dashboard.heatmap.useQuery({
  //   memberId,
  // });

  // const totalActivities = data?.reduce(
  //   (acc, curr) => acc + Number(curr.count),
  //   0,
  // );

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <p className="font-medium text-lg">Member Heatmap</p>
        <IconDoc url="https://docs.useconquest.com/member-heatmap" />
      </div>
      {/* <div className="flex gap-1 items-center text-muted-foreground">
        {isLoading ? (
          <Skeleton className="w-6 h-4" />
        ) : (
          <p>{totalActivities}</p>
        )}
        <p>
          {totalActivities === 1 ? "activity" : "activities"} in the last 365
          days
        </p>
      </div>
      <Heatmap activities={data} memberId={memberId} /> */}
    </div>
  );
};

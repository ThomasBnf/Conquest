"use client";

import { dateParams } from "@/lib/searchParamsDate";
import { trpc } from "@/server/client";
import { Separator } from "@conquest/ui/separator";
import { Skeleton } from "@conquest/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import { useQueryStates } from "nuqs";
import { Percentage } from "./percentage";
import { PeriodFormatter } from "./period-formatter";

export const EngagementRate = () => {
  const [{ from, to }] = useQueryStates(dateParams);

  const { data, isLoading } = trpc.dashboard.engagementRate.useQuery({
    from,
    to,
  });

  const { current, previous, variation } = data ?? {
    current: 0,
    previous: 0,
    variation: 0,
  };

  return (
    <div className="mb-0.5 flex flex-col overflow-hidden rounded-md border shadow-sm">
      <p className="bg-sidebar p-3 font-medium text-base">Engagement rate</p>
      <Separator />
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4">
        {isLoading ? (
          <Skeleton className="h-10 w-16" />
        ) : (
          <p className="font-bold text-4xl">{current.toFixed(0)}%</p>
        )}
        <Tooltip>
          <TooltipTrigger>
            <Percentage variation={variation} isLoading={isLoading} />
          </TooltipTrigger>
          <TooltipContent>
            <p>{previous.toFixed(0)}% engagement rate in the previous period</p>
          </TooltipContent>
        </Tooltip>
        <PeriodFormatter />
      </div>
    </div>
  );
};

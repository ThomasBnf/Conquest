"use client";

import { TooltipInfo } from "@/components/badges/tooltip-info";
import { dateParams } from "@/lib/dateParams";
import { trpc } from "@/server/client";
import { Separator } from "@conquest/ui/separator";
import { Skeleton } from "@conquest/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import { useQueryStates } from "nuqs";
import { Percentage } from "./percentage";
import { PeriodFormatter } from "./period-formatter";

export const TotalMembers = () => {
  const [{ from, to }] = useQueryStates(dateParams);

  const { data, isLoading, failureReason } =
    trpc.dashboard.totalMembers.useQuery({
      from,
      to,
    });

  console.log(failureReason);

  const { current, previous, variation } = data ?? {
    current: 0,
    previous: 0,
    variation: 0,
  };

  return (
    <div className="mb-0.5 flex flex-col overflow-hidden rounded-md border shadow-sm">
      <div className="flex h-[48px] items-center gap-2 bg-sidebar p-3">
        <p className="font-medium text-lg">Total members</p>
        <TooltipInfo content="Total members at the end of the selected period, all integrations included" />
      </div>
      <Separator />
      <div className="p flex flex-1 flex-col items-center justify-center gap-2 py-8">
        {isLoading ? (
          <Skeleton className="h-10 w-16" />
        ) : (
          <p className="font-bold text-4xl">{current}</p>
        )}
        <Tooltip>
          <TooltipTrigger>
            <Percentage variation={variation} isLoading={isLoading} />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {previous} member{previous > 1 ? "s" : ""} in the previous period
            </p>
          </TooltipContent>
        </Tooltip>
        <PeriodFormatter />
      </div>
    </div>
  );
};

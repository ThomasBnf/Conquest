"use client";

import { DatePicker } from "@/components/custom/date-picker";
import { useDateRange } from "@/hooks/useDateRange";
import { trpc } from "@/server/client";
import { Separator } from "@conquest/ui/separator";
import { Skeleton } from "@conquest/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import { Percentage } from "./percentage";
import { TimeFormat } from "./time-format";

export const TotalMembers = () => {
  const { date } = useDateRange();
  const { from, to } = date;

  const { data, isLoading } = trpc.dashboard.totalMembers.useQuery({
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
      <div className="flex items-center justify-between bg-sidebar p-3">
        <p className="font-medium text-lg">Total members</p>
        <DatePicker />
      </div>
      <Separator />
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-3">
        {isLoading ? (
          <Skeleton className="h-12 w-16" />
        ) : (
          <p className="font-bold text-5xl">{current}</p>
        )}
        <Tooltip>
          <TooltipTrigger>
            <Percentage variation={variation} isLoading={isLoading} />
          </TooltipTrigger>
          <TooltipContent>
            <p>{previous} total members in the previous period</p>
          </TooltipContent>
        </Tooltip>
        <TimeFormat />
      </div>
    </div>
  );
};

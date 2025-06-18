"use client";

import { IsLoading } from "@/components/states/is-loading";
import { useDateRange } from "@/hooks/useDateRange";
import { trpc } from "@/server/client";
import { getIcon } from "@/utils/getIcon";
import { Badge } from "@conquest/ui/badge";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { Source } from "@conquest/zod/enum/source.enum";
import { Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { type DateRange } from "react-day-picker";
import { DateRangePicker } from "./date-range-picker";
import { IntegrationsPicker } from "./integrations-picker";

export const TopActivityTypes = () => {
  const { globalDateRange } = useDateRange();
  const [sources, setSources] = useState<Source[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    globalDateRange,
  );

  const { data, isLoading } = trpc.dashboard.activityTypesByChannel.useQuery({
    dateRange,
    sources,
  });

  useEffect(() => {
    setDateRange(globalDateRange);
  }, [globalDateRange]);

  return (
    <div className="flex flex-col gap-4 rounded-md border p-4 shadow-sm">
      <div className="flex justify-between gap-2">
        <p className="font-medium text-lg">
          Top activity types by top channels
        </p>
        <div className="flex items-center gap-2">
          <IntegrationsPicker sources={sources} setSources={setSources} />
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>
      {isLoading ? (
        <IsLoading />
      ) : (
        <div>
          <div className="flex rounded-md border">
            <div className="divide-y border-r">
              {data?.map((group) => {
                const IconComponent = getIcon(group.source);

                return (
                  <div
                    key={group.channel}
                    className="flex h-12 min-w-max flex-1 items-center gap-1 p-2 pr-6"
                  >
                    <Hash size={16} />
                    <p className="mr-1">{group.channel}</p>
                    <IconComponent size={14} />
                  </div>
                );
              })}
            </div>
            <ScrollArea className="flex-1">
              <div className="flex flex-1 flex-col divide-y">
                {data?.map((group) => (
                  <div key={group.channel} className="flex h-12 gap-4 divide-x">
                    <div className="flex min-w-44 shrink-0 items-center gap-2 p-2">
                      <p>Total activities</p>
                      <Badge variant="secondary">
                        {group.activityTypes.reduce(
                          (acc, activityType) => acc + activityType.count,
                          0,
                        )}
                      </Badge>
                    </div>
                    {group.activityTypes.map((activityType) => (
                      <div
                        key={activityType.name}
                        className="flex min-w-44 shrink-0 items-center gap-1 p-2"
                      >
                        <p className="shrink-0">{activityType.name}</p>
                        <Badge variant="secondary">{activityType.count}</Badge>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};

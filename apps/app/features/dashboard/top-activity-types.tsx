"use client";

import { useDateRange } from "@/hooks/useDateRange";
import { Source } from "@conquest/zod/enum/source.enum";
import { useState } from "react";
import { type DateRange } from "react-day-picker";

export const TopActivityTypes = () => {
  const { globalDateRange } = useDateRange();
  const [sources, setSources] = useState<Source[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    globalDateRange,
  );

  // const { data, isLoading } = trpc.dashboard.activityTypesByChannel.useQuery({
  //   dateRange,
  //   sources,
  // });

  // useEffect(() => {
  //   setDateRange(globalDateRange);
  // }, [globalDateRange]);

  return (
    <div className="flex flex-col gap-4 rounded-md border p-4 shadow-sm">
      {/* <div className="flex gap-2 justify-between">
        <p className="text-lg font-medium">
          Top activity types by top channels
        </p>
        <div className="flex gap-2 items-center">
          <IntegrationsPicker sources={sources} setSources={setSources} />
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>
      {isLoading ? (
        <IsLoading />
      ) : data?.length ? (
        <div className="flex rounded-md border">
          <div className="border-r divide-y">
            {data.map((group) => {
              const IconComponent = getIcon(group.source);

              return (
                <div
                  key={group.channel}
                  className="flex flex-1 gap-1 items-center p-2 pr-6 min-w-max h-12"
                >
                  <Hash size={16} />
                  <p className="mr-1">{group.channel}</p>
                  <IconComponent size={14} />
                </div>
              );
            })}
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col flex-1 divide-y">
              {data.map((group) => (
                <div key={group.channel} className="flex gap-4 h-12 divide-x">
                  <div className="flex gap-2 items-center p-2 min-w-44 shrink-0">
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
                      className="flex gap-1 items-center p-2 min-w-44 shrink-0"
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
      ) : (
        <div className="flex justify-center items-center h-40">
          <p className="text-muted-foreground">No data available</p>
        </div>
      )} */}
    </div>
  );
};

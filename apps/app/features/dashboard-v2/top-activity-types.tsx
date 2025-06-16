"use client";

import { trpc } from "@/server/client";
import { getIcon } from "@/utils/getIcon";
import { Badge } from "@conquest/ui/badge";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { Source } from "@conquest/zod/enum/source.enum";
import { endOfDay, startOfDay, subWeeks } from "date-fns";
import { Hash } from "lucide-react";
import { useState } from "react";
import { DateRangePicker } from "./date-range-picker";
import { IntegrationsPicker } from "./integrations-picker";

export const TopActivityTypes = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subWeeks(startOfDay(new Date()), 4),
    to: endOfDay(new Date()),
  });

  const { from, to } = dateRange;

  const { data } = trpc.dashboardV2.topActivityTypes.useQuery({
    sources,
    from,
    to,
  });

  return (
    <div className="flex flex-col gap-6 rounded-md border p-6 shadow-sm">
      <div className="flex justify-between gap-2">
        <p className="font-semibold text-lg">Top activity types</p>
        <div className="flex items-center gap-1">
          <IntegrationsPicker sources={sources} setSources={setSources} />
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>
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
                  {group.activityTypes.map((activityType) => (
                    <div
                      key={activityType.name}
                      className="flex items-center gap-1 p-2"
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
    </div>
  );
};

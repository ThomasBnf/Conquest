"use client";

import { useDateRange } from "@/hooks/useDateRange";
import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { Source } from "@conquest/zod/enum/source.enum";
import { useEffect, useState } from "react";
import { type DateRange } from "react-day-picker";
import { FullNameCell } from "../table/cells/full-name-cell";
import { DateRangePicker } from "./date-range-picker";
import { IntegrationsPicker } from "./integrations-picker";

export const Leaderboard = () => {
  const { slug } = useWorkspace();
  const { globalDateRange } = useDateRange();
  const [sources, setSources] = useState<Source[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    globalDateRange,
  );

  const { data, failureReason } = trpc.dashboard.leaderboard.useQuery({
    sources,
    dateRange,
  });

  useEffect(() => {
    setDateRange(globalDateRange);
  }, [globalDateRange]);

  return (
    <div className="flex flex-col gap-4 rounded-md border p-4 shadow-sm">
      <div className="flex justify-between gap-2">
        <p className="font-medium text-lg">Leaderboard</p>
        <div className="flex items-center gap-2">
          <IntegrationsPicker sources={sources} setSources={setSources} />
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-muted-foreground">
          <p className="flex-1">Member</p>
          <p>Pulse Score</p>
        </div>
        {data?.length ? (
          <div className="flex flex-col">
            {data.map((member) => (
              <div key={member.id} className="flex items-center py-2">
                <div className="flex w-full items-center justify-between">
                  <FullNameCell member={member} />
                  <p>{member.pulse}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

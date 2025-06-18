"use client";

import { useDateRange } from "@/hooks/useDateRange";
import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Source } from "@conquest/zod/enum/source.enum";
import Link from "next/link";
import { useEffect, useState } from "react";
import { type DateRange } from "react-day-picker";
import { DateRangePicker } from "./date-range-picker";
import { IntegrationsPicker } from "./integrations-picker";

export const Leaderboard = () => {
  const { slug } = useWorkspace();
  const { globalDateRange } = useDateRange();
  const [sources, setSources] = useState<Source[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    globalDateRange,
  );

  const { data } = trpc.dashboard.leaderboard.useQuery({
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
        <div className="flex flex-col">
          {data?.map((member) => (
            <div key={member.memberId} className="flex items-center py-2">
              <div className="flex w-full items-center justify-between">
                <Link
                  href={`/${slug}/members/${member.memberId}/analytics`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Avatar className="size-7">
                    <AvatarImage src={member.avatarUrl ?? ""} />
                    <AvatarFallback>
                      {member.firstName?.charAt(0).toUpperCase()}
                      {member.lastName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p>
                    {member.firstName} {member.lastName}
                  </p>
                </Link>
                <p>{member.pulseScore}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

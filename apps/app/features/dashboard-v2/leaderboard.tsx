"use client";

import { useGetSlug } from "@/hooks/useGetSlug";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Source } from "@conquest/zod/enum/source.enum";
import { endOfDay, startOfDay, subWeeks } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { DateRangePicker } from "./date-range-picker";
import { IntegrationsPicker } from "./integrations-picker";

export const Leaderboard = () => {
  const slug = useGetSlug();
  const [sources, setSources] = useState<Source[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subWeeks(startOfDay(new Date()), 4),
    to: endOfDay(new Date()),
  });

  const { from, to } = dateRange;

  const { data, failureReason } = trpc.dashboardV2.leaderboard.useQuery({
    sources,
    from,
    to,
  });

  console.log(failureReason);
  console.dir(data, { depth: null });

  return (
    <div className="flex flex-col gap-6 rounded-md border p-6 shadow-sm">
      <div className="flex justify-between gap-2">
        <p className="font-semibold text-lg">Leaderboard</p>
        <div className="flex items-center gap-1">
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
                  href={`/${slug}/members/${member.memberId}`}
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

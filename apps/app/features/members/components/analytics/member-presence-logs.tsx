"use client";

import { EmptyStateChart } from "@/components/states/empty-state-chart";
import { getPresenceLabel } from "@/helpers/getPresenceLabel";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";

const chartConfig = {
  presence: {
    label: "Presence",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Props = {
  member: MemberWithCompany;
};

export const MemberPresenceLogs = ({ member }: Props) => {
  const logs = member.logs;

  const formattedLogs = logs.map((log) => ({
    date: format(log.date, "MMM d, yyyy"),
    presence: log.presence,
  }));

  return (
    <div className="relative">
      <p className="mb-2 font-medium text-lg">Presence Logs</p>
      {formattedLogs.length === 0 && <EmptyStateChart />}
      <ResponsiveContainer height={300} className="pr-1">
        <ChartContainer config={chartConfig}>
          <AreaChart data={formattedLogs}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                const { date, presence } = payload?.[0]?.payload ?? {};

                return (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    label={date}
                    indicator="line"
                    formatter={() => (
                      <div className="flex w-full gap-2">
                        <div className="h-full w-1 shrink-0 rounded-[2px] bg-main-500" />
                        <div className="flex items-end">
                          <div className="grid gap-1.5 pr-4">
                            <p className="font-medium leading-none">{date}</p>
                            <p className="text-muted-foreground">Presence</p>
                          </div>
                          <p className="font-medium">
                            {getPresenceLabel(presence)}
                          </p>
                        </div>
                      </div>
                    )}
                  />
                );
              }}
            />
            <defs>
              <linearGradient id="fill-presence" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <Area
              type="linear"
              dataKey="presence"
              fill="url(#fill-presence)"
              fillOpacity={0.4}
              stroke="hsl(var(--chart-1))"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};

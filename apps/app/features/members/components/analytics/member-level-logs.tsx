"use client";

import { EmptyStateChart } from "@/components/states/empty-state-chart";
import { getLevelLabel } from "@/helpers/getLevelLabel";
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
  level: {
    label: "Level",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Props = {
  member: MemberWithCompany;
};

export const MemberLevelLogs = ({ member }: Props) => {
  const logs = member.logs;

  const formattedLogs = logs.map((log) => ({
    date: format(log.date, "MMM d, yyyy"),
    pulse: log.pulse,
    presence: log.presence,
    level: log.level,
    max_weight: log.max_weight,
    max_weight_activity: log.max_weight_activity,
  }));

  return (
    <div className="relative">
      <p className="mb-2 pl-4 font-medium text-lg">Level Logs</p>
      {formattedLogs.length === 0 && <EmptyStateChart />}
      <ResponsiveContainer height={300} className="pr-1">
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={formattedLogs}
            margin={{ top: 24, left: 24, right: 24, bottom: 5 }}
          >
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
                const {
                  date,
                  max_weight,
                  presence,
                  level,
                  max_weight_activity,
                } = payload?.[0]?.payload ?? {};

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
                            <div className="grid gap-1">
                              <p>Level</p>
                              <p className="text-muted-foreground">
                                {max_weight > presence
                                  ? "Max Weight"
                                  : "Presence"}
                              </p>
                            </div>
                          </div>
                          <div className="grid gap-1">
                            <p className="font-medium">
                              {getLevelLabel(level)}
                            </p>
                            <p className="text-muted-foreground">
                              {max_weight > presence
                                ? max_weight_activity
                                : getPresenceLabel(presence)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                );
              }}
            />
            <defs>
              <linearGradient id="fill-level" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="level"
              fill="url(#fill-level)"
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

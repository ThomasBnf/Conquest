"use client";

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
  value: {
    label: "Love",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Props = {
  member: MemberWithCompany;
};

export const MemberLoveLogs = ({ member }: Props) => {
  const love_logs = member.love_logs;

  const formattedLogs = love_logs.map((log) => ({
    date: format(log.date, "MMM d, yyyy"),
    value: log.value,
  }));

  return (
    <div>
      <p className="mb-2 pl-4 font-medium text-lg">Love Logs</p>
      <ResponsiveContainer height={300}>
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
              content={
                <ChartTooltipContent indicator="line" className="w-60" />
              }
            />
            <defs>
              <linearGradient id="fillvalue" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="value"
              fill="url(#fillvalue)"
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

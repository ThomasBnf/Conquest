"use client";

import { IconDoc } from "@/components/custom/icon-doc";
import { EmptyStateChart } from "@/components/states/empty-state-chart";
import { trpc } from "@/server/client";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";
const chartConfig = {
  pulse: {
    label: "Pulse",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Props = {
  member: Member;
};

export const MemberPulseLogs = ({ member }: Props) => {
  const { data: logs, failureReason } = trpc.logs.list.useQuery({
    member_id: member.id,
  });

  const formattedLogs = logs?.map((log) => ({
    date: format(log.date, "MMM d, yyyy"),
    pulse: log.pulse,
  }));

  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="font-medium text-lg">Pulse Logs</p>
        <IconDoc url="https://docs.useconquest.com/pulse-score" />
      </div>
      <p className="mb-4 text-muted-foreground">
        Pulse Score evolution over the past 365 days, logged weekly.
      </p>
      {logs?.length === 0 && <EmptyStateChart />}
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
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <defs>
              <linearGradient id="fill-pulse" x1="0" y1="0" x2="0" y2="1">
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
              type="bump"
              dataKey="pulse"
              fill="url(#fill-pulse)"
              fillOpacity={0.4}
              stroke="hsl(var(--main-300))"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};

"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const chartConfig = {
  engagementRate: {
    label: "Engagement Rate",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Props = {
  from: Date;
  to: Date;
};

type ChartDataItem = {
  date: string;
  activities: number;
  engagementRate: number;
};

export const EngagementChart = ({ from, to }: Props) => {
  const { data: chartData } = useQuery<ChartDataItem[]>({
    queryKey: ["engagement", from, to],
    queryFn: async () => {
      const response = await ky
        .get("/api/dashboard/engagement", {
          searchParams: {
            from: from.toISOString(),
            to: to.toISOString(),
          },
        })
        .json<ChartDataItem[]>();
      return response;
    },
  });

  const maxValue = Math.max(
    ...(chartData?.map((item) => item.engagementRate) ?? [0]),
  );

  return (
    <ResponsiveContainer height={300}>
      <ChartContainer config={chartConfig}>
        <AreaChart
          data={chartData}
          margin={{
            top: 24,
            left: 32,
            right: 32,
            bottom: 12,
          }}
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
          <YAxis hide domain={[0, maxValue]} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="line"
                className="w-60"
                itemType="%"
              />
            }
          />
          <defs>
            <linearGradient id="fillEngagement" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-engagementRate)"
                stopOpacity={0.5}
              />
              <stop
                offset="95%"
                stopColor="var(--color-engagementRate)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <Area
            type="linear"
            dataKey="engagementRate"
            fill="url(#fillEngagement)"
            fillOpacity={0.4}
            stroke="var(--color-engagementRate)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
};

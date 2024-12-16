"use client";

import { useListEngagement } from "@/queries/hooks/useListEngagement";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const chartConfig = {
  percentage: {
    label: "Engagement Rate",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Props = {
  from: Date;
  to: Date;
};

export const EngagementChart = ({ from, to }: Props) => {
  const { data: chartData } = useListEngagement({ from, to });

  return (
    <ResponsiveContainer height={350}>
      <ChartContainer config={chartConfig}>
        <AreaChart
          data={chartData}
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
          <YAxis hide />
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
            <linearGradient id="fill-percentage" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-percentage)"
                stopOpacity={0.5}
              />
              <stop
                offset="95%"
                stopColor="var(--color-percentage)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <Area
            type="linear"
            dataKey="percentage"
            fill="url(#fill-percentage)"
            fillOpacity={0.4}
            stroke="var(--color-percentage)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
};

"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import {
  Bar,
  BarChart,
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
  return (
    <ResponsiveContainer height={350}>
      <ChartContainer config={chartConfig}>
        <BarChart
          // data={chartData}
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
            content={({ active, payload }) => {
              const { date, percentage } = payload?.[0]?.payload ?? {};
              return (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={date}
                  indicator="line"
                  formatter={() => (
                    <div className="flex w-full gap-2">
                      <div className="h-full w-1 shrink-0 rounded-[2px] bg-main-500" />
                      <div className="flex w-full items-end justify-between">
                        <div className="grid gap-1.5 pr-4">
                          <p className="font-medium leading-none">{date}</p>
                          <p className="text-muted-foreground">
                            Engagement Rate
                          </p>
                        </div>
                        <p className="font-medium">{percentage?.toFixed(2)}%</p>
                      </div>
                    </div>
                  )}
                />
              );
            }}
          />
          <Bar
            dataKey="percentage"
            fill="var(--color-percentage)"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
};

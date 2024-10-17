"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  engagement: {
    label: "Engagement Rate (%)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Props = {
  dailyEngagement: { date: string; engagement: number }[] | undefined;
};

export const ChartEngagement = ({ dailyEngagement }: Props) => {
  const chartData = dailyEngagement?.map(({ date, engagement }) => ({
    date,
    engagement: Number(engagement.toFixed(2)),
  }));

  return (
    <Card>
      <CardHeader className="border-b p-4">
        <CardTitle className="text-lg font-medium">Engagement</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
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
                <ChartTooltipContent
                  className="w-52"
                  nameKey="engagement"
                  indicator="line"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                    });
                  }}
                />
              }
            />
            <defs>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-engagement)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-engagement)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="engagement"
              type="monotone"
              fill="url(#colorEngagement)"
              fillOpacity={0.4}
              stroke="var(--color-engagement)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  engagement: {
    label: "Engagement Rate (%)",
    color: "hsl(var(--chart-1))",
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
        <CardTitle>Engagement</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
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
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
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
            <Bar
              dataKey="engagement"
              fill="var(--color-engagement)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

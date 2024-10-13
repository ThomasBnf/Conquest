"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import type { Activity } from "schemas/activity.schema";

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Props = {
  activities: Activity[] | undefined;
};

export const ChartActivityType = ({ activities }: Props) => {
  const groupedActivities = activities?.reduce(
    (acc, activity) => {
      acc[activity.details.type] = (acc[activity.details.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const chartData = Object.entries(groupedActivities || {}).map(
    ([type, count]) => ({
      type,
      count,
    }),
  );

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-medium">Activity type</CardTitle>
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
              dataKey="type"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-52"
                  nameKey="count"
                  indicator="line"
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

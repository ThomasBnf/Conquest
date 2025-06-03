"use client";

import { trpc } from "@/server/client";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { DateRangePicker } from "./date-range-picker";
import { IntegrationsPicker } from "./integrations-picker";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const TotalMembers = () => {
  const chartData = [
    { month: "Jan", desktop: 100 },
    { month: "Feb", desktop: 200 },
    { month: "Mar", desktop: 150 },
    { month: "Apr", desktop: 250 },
    { month: "May", desktop: 300 },
  ];

  const { data, failureReason } = trpc.dashboardV2.totalMembers.useQuery();
  console.log(data, failureReason);

  return (
    <div className="w-full rounded-md border p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <IntegrationsPicker />
        <DateRangePicker />
      </div>
      <ChartContainer config={chartConfig}>
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Area
            dataKey="desktop"
            type="natural"
            fill="var(--color-desktop)"
            fillOpacity={0.4}
            stroke="var(--color-desktop)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

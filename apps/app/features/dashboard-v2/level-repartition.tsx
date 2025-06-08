"use client";

import { IsLoading } from "@/components/states/is-loading";
import { trpc } from "@/server/client";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const chartConfig: ChartConfig = {
  count: {
    label: "Total members",
    color: "hsl(var(--chart-1))",
  },
};

export const LevelRepartition = () => {
  const { data, isLoading } = trpc.dashboardV2.levelRepartition.useQuery();

  const maxValue = Math.max(...(data?.map((d) => d.count) ?? []), 0) || 100;

  return (
    <div className="flex w-full flex-col gap-2 rounded-md border p-6 shadow-sm">
      <div className="flex justify-between gap-1">
        <p className="font-semibold text-lg">Level distribution of members</p>
      </div>
      <div className="flex gap-4">
        {isLoading ? (
          <div className="flex h-[350px] w-full items-center justify-center">
            <IsLoading />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ChartContainer config={chartConfig}>
              <BarChart data={data} layout="vertical">
                <CartesianGrid horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, maxValue * 1.1]}
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis
                  type="category"
                  dataKey="levelNumber"
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  fill="hsl(var(--chart-1))"
                >
                  {data?.map((entry) => (
                    <Cell key={`cell-${entry.levelNumber}`} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

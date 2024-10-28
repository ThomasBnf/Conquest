"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Skeleton } from "@conquest/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  total: {
    label: "Total members",
    color: "hsl(var(--chart-1))",
  },
  count: {
    label: "Total members",
    color: "hsl(var(--chart-1))",
  },
  newMembers: {
    label: "New members",
    color: "hsl(var(--chart-1))",
  },
  activeMembers: {
    label: "Avg. Daily active members",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Props = {
  from: Date;
  to: Date;
};

type ChartDataItem = {
  date: string;
  total: number;
  count: number;
  newMembers: number;
  activeMembers: number;
};

export const MembersChart = ({ from, to }: Props) => {
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>("count");

  const { data: chartData, isLoading } = useQuery<ChartDataItem[]>({
    queryKey: ["members", from, to],
    queryFn: async () => {
      const response = await ky
        .get("/api/dashboard/members", {
          searchParams: {
            from: from.toISOString(),
            to: to.toISOString(),
          },
        })
        .json<ChartDataItem[]>();
      return response;
    },
  });

  const total = useMemo(() => {
    if (!chartData?.length) return { count: 0, newMembers: 0 };

    return {
      count: chartData[chartData.length - 1]?.count ?? 0,
      newMembers: chartData.reduce((acc, curr) => acc + curr.newMembers, 0),
      avgActiveMembers:
        chartData.reduce((acc, curr) => acc + curr.activeMembers, 0) /
        chartData.length,
    };
  }, [chartData, activeChart]);

  return (
    <div className="divide-y">
      <div className="flex flex-1 divide-x">
        <button
          type="button"
          data-active={activeChart === "count"}
          className="flex flex-1 flex-col justify-center gap-1 p-6 data-[active=true]:bg-muted/50"
          onClick={() => setActiveChart("count")}
        >
          <span className="text-sm text-muted-foreground">Total members</span>
          {isLoading ? (
            <Skeleton className="h-9 w-12" />
          ) : (
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {chartData?.[chartData.length - 1]?.total}
            </span>
          )}
        </button>
        <button
          type="button"
          data-active={activeChart === "newMembers"}
          className="flex flex-1 flex-col justify-center gap-1 p-6 data-[active=true]:bg-muted/50"
          onClick={() => setActiveChart("newMembers")}
        >
          <span className="text-sm text-muted-foreground">
            {chartConfig.newMembers.label}
          </span>
          {isLoading ? (
            <Skeleton className="h-9 w-12" />
          ) : (
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {total.newMembers}
            </span>
          )}
        </button>
        <button
          type="button"
          data-active={activeChart === "activeMembers"}
          className="flex flex-1 flex-col justify-center gap-1 p-6 data-[active=true]:bg-muted/50"
          onClick={() => setActiveChart("activeMembers")}
        >
          <span className="text-sm text-muted-foreground">
            {chartConfig.activeMembers.label}
          </span>
          {isLoading ? (
            <Skeleton className="h-9 w-12" />
          ) : (
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {total.avgActiveMembers?.toFixed(0)}
            </span>
          )}
        </button>
      </div>
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[275px] w-full"
      >
        <AreaChart
          data={chartData}
          margin={{
            top: 24,
            left: 24,
            right: 24,
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
          <ChartTooltip
            content={<ChartTooltipContent indicator="line" className="w-60" />}
          />
          <defs>
            <linearGradient
              id={`fill${activeChart}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={`var(--color-${activeChart})`}
                stopOpacity={0.5}
              />
              <stop
                offset="95%"
                stopColor={`var(--color-${activeChart})`}
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <Area
            type="linear"
            dataKey={activeChart}
            fill={`url(#fill${activeChart})`}
            fillOpacity={0.4}
            stroke={`var(--color-${activeChart})`}
            strokeWidth={1.5}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

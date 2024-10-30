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
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";

const chartConfig = {
  members: {
    label: "Total members",
    color: "hsl(var(--chart-1))",
  },
  newMembers: {
    label: "New members",
    color: "hsl(var(--chart-1))",
  },
  activeMembers: {
    label: "Active members",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Props = {
  from: Date;
  to: Date;
};

type ChartDataProps = {
  totalMembers: number;
  totalActiveMembers: number;
  data: ChartDataItem[];
};

type ChartDataItem = {
  date: string;
  members: number;
  newMembers: number;
  activeMembers: number;
};

export const MembersChart = ({ from, to }: Props) => {
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>("members");

  const { data: chartData, isLoading } = useQuery({
    queryKey: ["members", from, to],
    queryFn: async () => {
      const response = await ky
        .get("/api/dashboard/members", {
          searchParams: {
            from: from.toISOString(),
            to: to.toISOString(),
          },
        })
        .json<ChartDataProps>();
      return response;
    },
  });

  const { totalMembers, totalActiveMembers, data } = chartData ?? {
    totalMembers: 0,
    totalActiveMembers: 0,
    data: [],
  };
  const totalNewMembers =
    data?.reduce((acc, curr) => acc + curr.newMembers, 0) ?? 0;

  return (
    <div className="divide-y">
      <div className="flex flex-1 divide-x">
        {Object.entries(chartConfig).map(([key, config]) => (
          <button
            key={key}
            type="button"
            data-active={activeChart === key}
            className="flex flex-1 flex-col justify-center gap-1 p-6 data-[active=true]:bg-muted"
            onClick={() => setActiveChart(key as keyof typeof chartConfig)}
          >
            <span className="text-sm text-muted-foreground">
              {config.label}
            </span>
            {isLoading ? (
              <Skeleton className="h-9 w-12" />
            ) : (
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {key === "members" && totalMembers}
                {key === "newMembers" && totalNewMembers}
                {key === "activeMembers" && totalActiveMembers}
              </span>
            )}
          </button>
        ))}
      </div>
      <ResponsiveContainer height={300}>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={data}
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
            <ChartTooltip
              content={
                <ChartTooltipContent indicator="line" className="w-60" />
              }
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
      </ResponsiveContainer>
    </div>
  );
};

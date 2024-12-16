"use client";

import { useListActiveMembers } from "@/queries/hooks/useListActiveMembers";
import { useListNewMembers } from "@/queries/hooks/useListNewMembers";
import { useListTotalMembers } from "@/queries/hooks/useListTotalMembers";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Skeleton } from "@conquest/ui/skeleton";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";

const chartConfig = {
  total_members: {
    label: "Total members",
    color: "hsl(var(--chart-1))",
  },
  new_members: {
    label: "New members",
    color: "hsl(var(--chart-1))",
  },
  active_members: {
    label: "Active members",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Props = {
  from: Date;
  to: Date;
};

export const MembersChart = ({ from, to }: Props) => {
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>("total_members");

  const { totalMembers, totalMembersData, isLoading } = useListTotalMembers({
    from,
    to,
  });
  const {
    newMembers,
    newMembersData,
    isLoading: _isLoading,
  } = useListNewMembers({ from, to });
  const {
    activeMembers,
    activeMembersData,
    isLoading: __isLoading,
  } = useListActiveMembers({
    from,
    to,
  });

  const loading = isLoading || _isLoading || __isLoading;

  const chartData = useMemo(() => {
    if (!totalMembersData || !newMembersData || !activeMembersData) return [];
    return Object.entries(totalMembersData).map(([date]) => ({
      date,
      total_members: totalMembersData[date],
      new_members: newMembersData[date],
      active_members: activeMembersData[date],
    }));
  }, [totalMembersData, newMembersData, activeMembersData]);

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
            <span className="text-muted-foreground text-sm">
              {config.label}
            </span>
            {loading ? (
              <Skeleton className="h-9 w-12" />
            ) : (
              <span className="font-bold text-lg leading-none sm:text-3xl">
                {key === "total_members" && totalMembers}
                {key === "new_members" && newMembers}
                {key === "active_members" && activeMembers}
              </span>
            )}
          </button>
        ))}
      </div>
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

"use client";

import { listActiveMembers } from "@/client/dashboard/listActiveMembers";
import { listNewMembers } from "@/client/dashboard/listNewMembers";
import { listTotalMembers } from "@/client/dashboard/listTotalMembers";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Skeleton } from "@conquest/ui/skeleton";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
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

  const { totalMembers, totalMembersData, isLoading } = listTotalMembers({
    from,
    to,
  });

  const {
    newMembers,
    newMembersData,
    isLoading: _isLoading,
  } = listNewMembers({ from, to });

  const {
    activeMembers,
    activeMembersData,
    isLoading: __isLoading,
  } = listActiveMembers({
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
              <Skeleton className="h-[30px] w-12" />
            ) : (
              <span className="font-bold text-3xl leading-none">
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
          <BarChart
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
            <Bar
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};

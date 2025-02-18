"use client";

import { trpc } from "@/server/client";
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
  totalMembers: {
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

export const MembersChart = ({ from, to }: Props) => {
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>("totalMembers");

  const { data, isLoading } = trpc.dashboard.totalMembers.useQuery({
    from,
    to,
  });

  const { data: newData, isLoading: _isLoading } =
    trpc.dashboard.newMembers.useQuery({
      from,
      to,
    });

  const { data: activeData, isLoading: __isLoading } =
    trpc.dashboard.activeMembers.useQuery({
      from,
      to,
    });

  const { totalMembers, membersData } = data ?? {};
  const { newMembers, newMembersData } = newData ?? {};
  const { activeMembers, activeMembersData } = activeData ?? {};

  const loading = isLoading || _isLoading || __isLoading;

  const chartData = useMemo(() => {
    const hasAllData =
      totalMembers &&
      membersData &&
      newMembers &&
      newMembersData &&
      activeMembers &&
      activeMembersData;

    if (!hasAllData) return [];

    return Object.keys(membersData).map((date) => ({
      date,
      totalMembers,
      newMembers: newMembersData[date],
      activeMembers: activeMembersData[date],
    }));
  }, [
    totalMembers,
    membersData,
    newMembers,
    newMembersData,
    activeMembers,
    activeMembersData,
  ]);

  return (
    <div className="divide-y">
      <div className="flex flex-1 divide-x">
        {Object.entries(chartConfig).map(([key, config]) => (
          <button
            key={key}
            type="button"
            data-active={activeChart === key}
            className="flex flex-1 flex-col justify-center gap-1 p-6 text-start data-[active=true]:bg-muted"
            onClick={() => setActiveChart(key as keyof typeof chartConfig)}
          >
            <span className="text-muted-foreground text-sm">
              {config.label}
            </span>
            {loading ? (
              <Skeleton className="h-[30px] w-12" />
            ) : (
              <span className="font-bold text-3xl leading-none">
                {key === "totalMembers" && totalMembers}
                {key === "newMembers" && newMembers}
                {key === "activeMembers" && activeMembers}
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

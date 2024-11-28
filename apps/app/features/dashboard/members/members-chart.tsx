"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Skeleton } from "@conquest/ui/skeleton";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import { useQuery } from "@tanstack/react-query";
import { eachDayOfInterval, format } from "date-fns";
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
  total_members: number;
  new_members: number;
  active_members: number;
  members: MemberWithActivities[];
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

  const { total_members, new_members, active_members, members } = chartData ?? {
    total_members: 0,
    new_members: 0,
    active_members: 0,
    members: [],
  };

  const getChartData = () => {
    const dates = eachDayOfInterval({ start: from, end: to });
    let totalMembers = 0;

    return dates.map((date) => {
      const formattedDate = format(date, "yyyy-MM-dd");

      const membersOnDate = members.filter((member) => {
        if (!member.created_at) return false;
        return (
          format(new Date(member.created_at), "yyyy-MM-dd") === formattedDate
        );
      });

      const newMembersOnDate = members.filter((member) => {
        if (!member.joined_at) return false;
        return (
          format(new Date(member.joined_at), "yyyy-MM-dd") === formattedDate
        );
      });

      const activeMembersOnDate = members.filter((member) => {
        if (!member.activities?.length) return false;
        return member.activities.some(
          (activity) =>
            format(new Date(activity.created_at), "yyyy-MM-dd") ===
            formattedDate,
        );
      });

      totalMembers += membersOnDate.length;

      return {
        date: formattedDate,
        members: totalMembers,
        newMembers: newMembersOnDate.length,
        activeMembers: activeMembersOnDate.length,
      };
    });
  };

  const chartDataByDate = getChartData();

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
            {isLoading ? (
              <Skeleton className="h-9 w-12" />
            ) : (
              <span className="font-bold text-lg leading-none sm:text-3xl">
                {key === "members" && total_members}
                {key === "newMembers" && new_members}
                {key === "activeMembers" && active_members}
              </span>
            )}
          </button>
        ))}
      </div>
      <ResponsiveContainer height={300}>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={chartDataByDate}
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

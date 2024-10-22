"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import { eachDayOfInterval, format, isWithinInterval } from "date-fns";
import { useDateRange } from "hooks/useDateRange";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  active: {
    label: "Active members",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Props = {
  members: MemberWithActivities[] | undefined;
};

type ActiveMembers = {
  members: MemberWithActivities[] | undefined;
  from: Date;
  to: Date;
};

const getActiveMembers = ({ members, from, to }: ActiveMembers) => {
  if (!members?.length) return [];

  const activeMembers = members.reduce(
    (acc, member) => {
      for (const activity of member.activities) {
        const activityDate = new Date(activity.created_at);
        const localActivityDate = new Date(
          activityDate.toLocaleString("en-US", { timeZone: "UTC" }),
        );

        if (
          isWithinInterval(localActivityDate, {
            start: from,
            end: to,
          })
        ) {
          const dateString = format(localActivityDate, "yyyy-MM-dd");

          if (!acc[dateString]) {
            acc[dateString] = new Set<string>();
          }
          acc[dateString].add(member.id);
        }
      }
      return acc;
    },
    {} as Record<string, Set<string>>,
  );

  return eachDayOfInterval({ start: from, end: to }).map((date) => {
    const dateString = format(date, "yyyy-MM-dd");

    return {
      date: dateString,
      active: activeMembers[dateString]?.size || 0,
    };
  });
};

export const ChartActiveMembers = ({ members }: Props) => {
  const [{ from, to }] = useDateRange();
  const chartData = getActiveMembers({ members, from, to });

  return (
    <Card>
      <CardHeader className="border-b p-4">
        <CardTitle className="font-medium text-lg">Active members</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
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
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-52"
                  nameKey="active"
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
            <defs>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-active)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-active)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="active"
              type="monotone"
              fill="url(#colorActive)"
              fillOpacity={0.4}
              stroke="var(--color-active)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

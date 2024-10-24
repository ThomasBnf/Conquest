"use client";

import { Button } from "@conquest/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import {
  eachDayOfInterval,
  format,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { useDateRange } from "hooks/useDateRange";
import ky from "ky";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  active: {
    label: "New members",
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

const getMembers = ({ members, from, to }: ActiveMembers) => {
  if (!members?.length) return [];

  const groupedMembers = members.reduce(
    (acc, member) => {
      const createdAt = format(new Date(member.created_at), "yyyy-MM-dd");

      if (isWithinInterval(parseISO(createdAt), { start: from, end: to })) {
        acc[createdAt] = (acc[createdAt] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  return eachDayOfInterval({ start: from, end: to }).map((date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return {
      date: dateString,
      active: groupedMembers[dateString] || 0,
    };
  });
};

export const ChartMembers = ({ members }: Props) => {
  const [{ from, to }] = useDateRange();
  const chartData = getMembers({ members, from, to });

  const onClick = async () => {
    const json = await ky.get("/api/activities?page=1").json();
    console.log(json);
  };

  return (
    <Card>
      <CardHeader className="border-b p-4">
        <CardTitle className="text-lg font-medium">Members</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <Button onClick={onClick}>test</Button>
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

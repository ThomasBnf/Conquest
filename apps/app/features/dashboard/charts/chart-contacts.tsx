"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import type { ContactWithActivities } from "@conquest/zod/activity.schema";
import {
  eachDayOfInterval,
  format,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { useDateRange } from "hooks/useDateRange";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  active: {
    label: "New contacts",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Props = {
  contacts: ContactWithActivities[] | undefined;
};

type ActiveContacts = {
  contacts: ContactWithActivities[] | undefined;
  from: Date;
  to: Date;
};

const getContacts = ({ contacts, from, to }: ActiveContacts) => {
  if (!contacts?.length) return [];

  const groupedContacts = contacts.reduce(
    (acc, contact) => {
      const createdAt = format(new Date(contact.created_at), "yyyy-MM-dd");

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
      active: groupedContacts[dateString] || 0,
    };
  });
};

export const ChartContacts = ({ contacts }: Props) => {
  const [{ from, to }] = useDateRange();
  const chartData = getContacts({ contacts, from, to });

  return (
    <Card>
      <CardHeader className="border-b p-4">
        <CardTitle className="text-lg font-medium">Contacts</CardTitle>
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

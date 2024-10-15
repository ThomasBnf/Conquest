"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import type { ContactWithActivities } from "@conquest/zod/activity.schema";
import { eachDayOfInterval, format, isWithinInterval } from "date-fns";
import { useDateRange } from "hooks/useDateRange";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  active: {
    label: "Active contacts",
    color: "hsl(var(--chart-1))",
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

const getActiveContacts = ({ contacts, from, to }: ActiveContacts) => {
  if (!contacts?.length) return [];

  const activeContacts = contacts.reduce(
    (acc, contact) => {
      for (const activity of contact.activities) {
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
          acc[dateString].add(contact.id);
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
      active: activeContacts[dateString]?.size || 0,
    };
  });
};

export const ChartActiveContacts = ({ contacts }: Props) => {
  const [{ from, to }] = useDateRange();
  const chartData = getActiveContacts({ contacts, from, to });

  return (
    <Card>
      <CardHeader className="border-b p-4">
        <CardTitle className="font-medium text-lg">Active contacts</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
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
            <Bar
              dataKey="active"
              fill="var(--color-active)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

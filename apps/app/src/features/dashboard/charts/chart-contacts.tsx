"use client";

import { useDateRange } from "@/hooks/useDateRange";
import type { ContactWithActivities } from "@/schemas/activity.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { eachDayOfInterval, format, isWithinInterval } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  active: {
    label: "New contacts",
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

const getContacts = ({ contacts, from, to }: ActiveContacts) => {
  if (!contacts?.length) return [];

  const groupedContacts = contacts.reduce(
    (acc, contact) => {
      const createdAt = format(contact.created_at, "yyyy-MM-dd");

      if (isWithinInterval(createdAt, { start: from, end: to })) {
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

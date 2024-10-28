"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

type Props = {
  from: Date;
  to: Date;
};

const chartConfig = {
  activities: {
    label: "Activities",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig;

type ChartDataItem = {
  member: MemberWithActivities;
  activities: number;
};

export const MembersTop = ({ from, to }: Props) => {
  const { data: chartData } = useQuery<ChartDataItem[]>({
    queryKey: ["members-top", from, to],
    queryFn: async () => {
      const response = await ky
        .get("/api/dashboard/members/top", {
          searchParams: {
            from: from.toISOString(),
            to: to.toISOString(),
          },
        })
        .json<ChartDataItem[]>();
      return response;
    },
  });

  return (
    <div className="flex-1 p-4 space-y-2">
      <p className="pl-1.5 text-base font-medium">Top Members</p>
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={chartData} layout="vertical">
          <YAxis
            dataKey="member"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            hide
          />
          <XAxis dataKey="activities" type="number" hide />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Bar
            dataKey="activities"
            layout="vertical"
            fill="var(--color-activities)"
            radius={4}
          >
            <LabelList
              dataKey="member"
              position="insideLeft"
              offset={10}
              className="fill-muted-foreground"
              fontSize={12}
            />
            <LabelList
              dataKey="activities"
              position="right"
              offset={10}
              className="fill-muted-foreground"
              fontSize={12}
              formatter={(value: number) => (value > 0 ? value : "")}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
};

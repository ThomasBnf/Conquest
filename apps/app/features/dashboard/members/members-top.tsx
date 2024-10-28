"use client";

import { type ChartConfig, ChartContainer } from "@conquest/ui/chart";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { useRef } from "react";
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
  const ref = useRef<HTMLDivElement>(null);

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
      <ChartContainer ref={ref} config={chartConfig}>
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
              className="fill-muted-foreground text-xs"
              content={({ value, x, y, height }) => {
                const yPos = Number(y) + Number(height) / 2 + 5;
                return (
                  <text x={Number(x) + 10} y={yPos} className="text-xs">
                    {value}
                  </text>
                );
              }}
            />
            <LabelList
              dataKey="activities"
              position="right"
              offset={10}
              className="fill-muted-foreground text-xs"
              content={({ value, y }) => {
                const xPos = Number(ref.current?.clientWidth) - 20;
                const yPos = Number(y) + 20;
                return (
                  <text x={xPos} y={yPos} className="text-xs">
                    {value}
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
};

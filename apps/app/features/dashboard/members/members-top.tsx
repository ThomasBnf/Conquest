"use client";

import { type ChartConfig, ChartContainer } from "@conquest/ui/chart";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { useMemo, useRef } from "react";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  from: Date;
  to: Date;
};

const chartConfig = {
  activities: {
    label: "Activities",
    color: "hsl(var(--main-100))",
  },
} satisfies ChartConfig;

type ChartDataItem = {
  member: MemberWithActivities;
  activities: number;
  normalizedCount: number;
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

  const normalizedData = useMemo(() => {
    if (!chartData) return [];

    const maxCount = Math.max(...chartData.map((item) => item.activities));

    return chartData.map((item) => ({
      ...item,
      normalizedCount: (item.activities / maxCount) * 100,
    }));
  }, [chartData]);

  return (
    <div className="flex-1 space-y-2 p-4">
      <p className="pl-1.5 text-base font-medium">Top Members</p>
      <ResponsiveContainer height={350} width="100%">
        <ChartContainer ref={ref} config={chartConfig}>
          <BarChart accessibilityLayer data={normalizedData} layout="vertical">
            <YAxis
              dataKey="member"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis
              dataKey="normalizedCount"
              type="number"
              domain={[0, 100]}
              hide
            />
            <Bar
              dataKey="normalizedCount"
              layout="vertical"
              fill="var(--color-activities)"
              radius={4}
              alignmentBaseline="baseline"
            >
              <LabelList
                dataKey="member"
                position="insideLeft"
                offset={10}
                className="fill-muted-foreground text-xs"
                content={({ value, x, y, height }) => {
                  const yPos = Number(y) + Number(height) / 2 + 5;
                  return (
                    <text x={Number(x) + 10} y={yPos} className="font-medium">
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
                content={({ value, y, height }) => {
                  const containerWidth = ref.current?.clientWidth ?? 0;
                  const xPos = containerWidth - 20;
                  const yPos = Number(y) + Number(height) / 2 + 5;
                  return (
                    <text
                      x={xPos}
                      y={yPos}
                      textAnchor="end"
                      className="font-medium"
                    >
                      {value}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};

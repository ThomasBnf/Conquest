"use client";

import { type ChartConfig, ChartContainer } from "@conquest/ui/chart";
import type { ChannelWithActivitiesCount } from "@conquest/zod/channel.schema";
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

type NormalizedChannelData = ChannelWithActivitiesCount & {
  normalizedCount: number;
};

export const ChannelsTop = ({ from, to }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const { data: chartData } = useQuery({
    queryKey: ["channels-top", from, to],
    queryFn: async () => {
      const response = await ky
        .get("/api/dashboard/engagement/channels/top", {
          searchParams: {
            from: from.toISOString(),
            to: to.toISOString(),
          },
        })
        .json<ChannelWithActivitiesCount[]>();
      return response;
    },
  });

  const normalizedData = useMemo(() => {
    if (!chartData) return [];

    const maxCount = Math.max(
      ...chartData.map((item) => item._count.activities),
    );

    return chartData.map((item) => ({
      ...item,
      normalizedCount: (item._count.activities / maxCount) * 100,
    }));
  }, [chartData]);

  return (
    <div className="flex-1 p-4 space-y-2">
      <p className="pl-1.5 text-base font-medium">Top Active Channels</p>
      <ResponsiveContainer height={350} width="100%">
        <ChartContainer ref={ref} config={chartConfig}>
          <BarChart accessibilityLayer data={normalizedData} layout="vertical">
            <YAxis
              dataKey="name"
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
                dataKey="name"
                position="insideLeft"
                offset={10}
                className="fill-muted-foreground text-xs"
                content={({ value, x, y, height }) => {
                  const yPos = Number(y) + Number(height) / 2 + 5;
                  return (
                    <text x={Number(x) + 10} y={yPos} className="font-medium">
                      #{value}
                    </text>
                  );
                }}
              />
              <LabelList
                dataKey="_count.activities"
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

"use client";

import { useListTopChannels } from "@/client/dashboard/listTopChannels";
import { type ChartConfig, ChartContainer } from "@conquest/ui/chart";
import { useRef } from "react";
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

export const TopChannels = ({ from, to }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const { data: topChannels } = useListTopChannels({ from, to });

  return (
    <div className="flex-1 p-4">
      <p className="pl-1.5 font-medium text-base">Top Channels</p>
      <div className="mt-4 flex items-center justify-between px-2 text-muted-foreground">
        <p>Channels</p>
        <p>Activities</p>
      </div>
      <ResponsiveContainer height={350} width="100%">
        <ChartContainer ref={ref} config={chartConfig}>
          <BarChart accessibilityLayer data={topChannels} layout="vertical">
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis
              dataKey="_count.activities"
              type="number"
              domain={[0, "dataMax"]}
              hide
            />
            <Bar
              dataKey="_count.activities"
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

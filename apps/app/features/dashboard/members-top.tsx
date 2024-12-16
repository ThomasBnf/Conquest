"use client";

import { useListTopMembers } from "@/queries/hooks/useListTopMembers";
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
  love: {
    label: "Love",
    color: "hsl(var(--main-100))",
  },
} satisfies ChartConfig;

export const MembersTop = ({ from, to }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const { data: topMembers } = useListTopMembers({ from, to });

  const chartData = topMembers?.map((member) => ({
    ...member,
    full_name: `${member.first_name} ${member.last_name}`,
  }));

  return (
    <div className="flex-1 p-4">
      <p className="pl-2 font-medium text-base">Top Members</p>
      <div className="mt-4 flex items-center justify-between px-2 text-muted-foreground">
        <p>Members</p>
        <p>Love</p>
      </div>
      <ResponsiveContainer height={350} width="100%">
        <ChartContainer ref={ref} config={chartConfig}>
          <BarChart accessibilityLayer data={chartData} layout="vertical">
            <YAxis
              dataKey="full_name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis dataKey="love" type="number" domain={[0, "dataMax"]} hide />
            <Bar
              dataKey="love"
              layout="vertical"
              fill="var(--color-love)"
              radius={4}
              alignmentBaseline="baseline"
            >
              <LabelList
                dataKey="full_name"
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
                dataKey="love"
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

"use client";

import { useUser } from "@/context/userContext";
import { useListTopMembers } from "@/queries/hooks/useListTopMembers";
import { type ChartConfig, ChartContainer } from "@conquest/ui/chart";
import { useRouter } from "next/navigation";
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
  pulse: {
    label: "Pulse",
    color: "hsl(var(--main-100))",
  },
} satisfies ChartConfig;

export const MembersTop = ({ from, to }: Props) => {
  const { slug } = useUser();
  const router = useRouter();
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
        <p>Pulse</p>
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
            <XAxis dataKey="pulse" type="number" domain={[0, "dataMax"]} hide />
            <Bar
              dataKey="pulse"
              layout="vertical"
              fill="var(--color-pulse)"
              radius={4}
              alignmentBaseline="baseline"
            >
              <LabelList
                dataKey="full_name"
                position="insideLeft"
                offset={10}
                className="fill-muted-foreground text-xs"
                content={({ value, id, x, y, height }) => {
                  const yPos = Number(y) + Number(height) / 2 + 5;
                  return (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                    <text
                      x={Number(x) + 10}
                      y={yPos}
                      className="cursor-pointer font-medium hover:underline"
                      onClick={() => router.push(`/${slug}/members/${id}`)}
                    >
                      {value}
                    </text>
                  );
                }}
              />
              <LabelList
                dataKey="pulse"
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

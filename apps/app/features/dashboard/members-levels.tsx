"use client";

import { listMembersLevels } from "@/client/dashboard/listMembersLevels";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

type Props = {
  from: Date;
  to: Date;
};

const chartConfig = {
  current: {
    label: "Current",
    color: "hsl(var(--main-500))",
  },
  max: {
    label: "Ever",
    color: "hsl(var(--main-300))",
  },
} satisfies ChartConfig;

const LEVEL_LABELS = {
  explorer: "Explorer",
  active: "Active",
  contributor: "Contributor",
  ambassador: "Ambassador",
} as const;

export const MembersLevels = ({ from, to }: Props) => {
  const { data } = listMembersLevels({ from, to });

  const transformedData = Object.keys(LEVEL_LABELS).map((level) => ({
    level,
    levelLabel: LEVEL_LABELS[level as keyof typeof LEVEL_LABELS],
    current: data?.current?.[level] ?? 0,
    max: data?.max?.[level] ?? 0,
  }));

  return (
    <div className="flex-1 space-y-2 p-4">
      <p className="pl-1.5 font-medium text-base">Members Levels</p>
      <ResponsiveContainer height={380} width="100%">
        <ChartContainer config={chartConfig}>
          <BarChart data={transformedData} barGap={0} barCategoryGap={8}>
            <XAxis dataKey="levelLabel" fontSize={12} tickLine={false} />
            <YAxis scale="sqrt" hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="max"
              fill="hsl(var(--main-300))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="current"
              fill="hsl(var(--main-500))"
              radius={[4, 4, 0, 0]}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};

"use client";

import { listMembersLevels } from "@/client/dashboard/listMembersLevels";
import { getLevelLabel } from "@/helpers/getLevelLabel";
import {
  type ChartConfig,
  ChartContainer,
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
    label: "Max",
    color: "hsl(var(--main-300))",
  },
} satisfies ChartConfig;

export const MembersLevels = ({ from, to }: Props) => {
  const { data } = listMembersLevels({ from, to });

  const transformedData = Array.from({ length: 12 }, (_, i) => ({
    level: i + 1,
    levelLabel: getLevelLabel(i + 1),
    current: data?.current?.[i + 1] ?? 0,
    max: data?.max?.[i + 1] ?? 0,
  }));

  return (
    <div className="flex-1 space-y-2 p-4">
      <p className="pl-1.5 font-medium text-base">Members Levels</p>
      <ResponsiveContainer height={380} width="100%">
        <ChartContainer config={chartConfig}>
          <BarChart data={transformedData} barGap={0} barCategoryGap={8}>
            <XAxis
              dataKey="levelLabel"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              fontSize={12}
            />
            <YAxis scale="sqrt" />
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
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};

"use client";

import { trpc } from "@/server/client";
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
  currentMembers: {
    label: "Current",
    color: "hsl(var(--main-500))",
  },
  maxMembers: {
    label: "Ever",
    color: "hsl(var(--main-300))",
  },
} satisfies ChartConfig;

export const MembersLevels = ({ from, to }: Props) => {
  const { data } = trpc.dashboard.membersLevels.useQuery({ from, to });

  return (
    <div className="flex-1 space-y-2 p-4">
      <p className="pl-1.5 font-medium text-base">Members Levels</p>
      <ResponsiveContainer height={380} width="100%">
        <ChartContainer config={chartConfig}>
          <BarChart
            data={[]}
            barGap={0}
            barCategoryGap={8}
            margin={{ left: 0, right: 16 }}
          >
            <XAxis
              dataKey="name"
              fontSize={10}
              tickLine={false}
              angle={-90}
              textAnchor="end"
              height={80}
            />
            <YAxis scale="linear" hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="maxMembers"
              fill="hsl(var(--main-300))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="currentMembers"
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

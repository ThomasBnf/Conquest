"use client";

import { useListMembersLevels } from "@/queries/hooks/useListMembersLevels";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Pie, PieChart, ResponsiveContainer } from "recharts";

type Props = {
  from: Date;
  to: Date;
};

const chartConfig = {
  count: {
    label: "Count",
  },
  explorer: {
    label: "Explorer",
    color: "hsl(var(--main-500))",
  },
  active: {
    label: "Active",
    color: "hsl(var(--main-500))",
  },
  contributor: {
    label: "Contributor",
    color: "hsl(var(--main-600))",
  },
  ambassador: {
    label: "Ambassador",
    color: "hsl(var(--main-700))",
  },
} satisfies ChartConfig;

export const MembersLevels = ({ from, to }: Props) => {
  const { data } = useListMembersLevels({ from, to });

  const colors = {
    explorer: "hsl(var(--main-200))",
    active: "hsl(var(--main-400))",
    contributor: "hsl(var(--main-600))",
    ambassador: "hsl(var(--main-800))",
  };

  const transformedData = data?.map((item) => ({
    ...item,
    count: item.I + item.II + item.III,
    fill: colors[item.category.toLowerCase() as keyof typeof colors],
  }));

  return (
    <div className="flex-1 space-y-2 p-4">
      <p className="pl-1.5 font-medium text-base">Members Levels</p>
      <ResponsiveContainer height={380} width="100%">
        <ChartContainer config={chartConfig}>
          <PieChart>
            <ChartTooltip
              content={({ active, payload }) => {
                const { I, II, III } = payload?.[0]?.payload ?? {};

                return (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    indicator="line"
                    formatter={(value, name, item) => {
                      return (
                        <div className="grid w-full grid-rows-3 gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-full w-1 shrink-0 rounded-[2px]"
                              style={{
                                backgroundColor: item?.payload?.fill,
                              }}
                            />
                            <p className="font-medium">Total {value}</p>
                          </div>
                          <div className="flex flex-1 items-center justify-between gap-6">
                            <p className="text-muted-foreground">{name} III</p>
                            <p className="font-medium">{III}</p>
                          </div>
                          <div className="flex flex-1 items-center justify-between gap-6">
                            <p className="text-muted-foreground">{name} II</p>
                            <p className="font-medium">{II}</p>
                          </div>
                          <div className="flex flex-1 items-center justify-between gap-6">
                            <p className="text-muted-foreground">{name} III</p>
                            <p className="font-medium">{III}</p>
                          </div>
                        </div>
                      );
                    }}
                  />
                );
              }}
            />
            <Pie data={transformedData} dataKey="count" nameKey="category" />
          </PieChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};

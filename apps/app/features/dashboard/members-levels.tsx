"use client";

import { useListMembersLevels } from "@/queries/hooks/useListMembersLevels";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { cn } from "@conquest/ui/src/utils/cn";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";

type Props = {
  from: Date;
  to: Date;
};

const chartConfig = {
  I: {
    color: "hsl(var(--chart-1))",
  },
  II: {
    color: "hsl(var(--chart-2))",
  },
  III: {
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export const MembersLevels = ({ from, to }: Props) => {
  const { data } = useListMembersLevels({ from, to });

  return (
    <div className="flex-1 space-y-2 p-4">
      <p className="pl-1.5 font-medium text-base">Members Levels</p>
      <ResponsiveContainer height={380} width="100%">
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickMargin={10}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                const { category } = payload?.[0]?.payload ?? {};

                return (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    indicator="line"
                    formatter={(value, name, item) => {
                      return (
                        <div className="flex w-full gap-2">
                          <div
                            className={cn(
                              "h-full w-1 shrink-0 rounded-[2px]",
                              item?.color === "var(--color-I)" &&
                                "bg-[hsl(var(--chart-1))]",
                              item?.color === "var(--color-II)" &&
                                "bg-[hsl(var(--chart-2))]",
                              item?.color === "var(--color-III)" &&
                                "bg-[hsl(var(--chart-3))]",
                            )}
                          />
                          <div className="flex flex-1 items-center justify-between gap-6">
                            <p className="text-muted-foreground">
                              {category} {name}
                            </p>
                            <p className="font-medium">{value}</p>
                          </div>
                        </div>
                      );
                    }}
                  />
                );
              }}
            />
            <Bar
              dataKey="I"
              stackId="a"
              fill="var(--color-I)"
              radius={[0, 0, 4, 4]}
            />
            <Bar dataKey="II" stackId="a" fill="var(--color-II)" />
            <Bar
              dataKey="III"
              stackId="a"
              fill="var(--color-III)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};

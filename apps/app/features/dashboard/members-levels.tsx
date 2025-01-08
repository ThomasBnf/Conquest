"use client";

import { listMembersLevels } from "@/client/dashboard/listMembersLevels";
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
    color: "hsl(var(--main-300))",
  },
  active: {
    label: "Active",
    color: "hsl(var(--main-500))",
  },
  contributor: {
    label: "Contributor",
    color: "hsl(var(--main-700))",
  },
  ambassador: {
    label: "Ambassador",
    color: "hsl(var(--main-900))",
  },
} satisfies ChartConfig;

export const MembersLevels = ({ from, to }: Props) => {
  const { data } = listMembersLevels({ from, to });

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
                        <div className="flex gap-2">
                          <div
                            className="w-1 rounded-[2px]"
                            style={{
                              backgroundColor: item?.payload?.fill,
                            }}
                          />
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between gap-6">
                              <p className="font-medium">{name}</p>
                              <p className="font-medium">{value}</p>
                            </div>
                            <div className="flex justify-between gap-6">
                              <p className="text-muted-foreground">
                                {name} III
                              </p>
                              <p className="font-medium">{III}</p>
                            </div>
                            <div className="flex justify-between gap-6">
                              <p className="text-muted-foreground">{name} II</p>
                              <p className="font-medium">{II}</p>
                            </div>
                            <div className="flex justify-between gap-6">
                              <p className="text-muted-foreground">{name} I</p>
                              <p className="font-medium">{I}</p>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                );
              }}
            />
            <Pie
              data={transformedData}
              dataKey="count"
              nameKey="category"
              paddingAngle={4}
              cornerRadius={4}
              innerRadius="40%"
              outerRadius="75%"
              labelLine={false}
              label={({ payload, ...props }) => {
                if (payload.count === 0) return;
                return (
                  <text
                    x={props.x - 8}
                    y={props.y}
                    textAnchor={props.textAnchor}
                    dominantBaseline={props.dominantBaseline}
                  >
                    {payload.category}
                  </text>
                );
              }}
            />
          </PieChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};

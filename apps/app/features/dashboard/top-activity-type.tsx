"use client";

import { dateParams } from "@/lib/dateParams";
import { trpc } from "@/server/client";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Separator } from "@conquest/ui/separator";
import { Loader2 } from "lucide-react";
import { useQueryStates } from "nuqs";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const chartConfig = {
  count: {
    label: "Total activities",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export const TopActivityType = () => {
  const [{ from, to }] = useQueryStates(dateParams);

  const { data, isLoading } = trpc.dashboard.topActivityType.useQuery({
    from,
    to,
  });

  const formattedData = data?.map((item) => ({
    ...item,
    count: Number(item.count),
  }));

  return (
    <div className="mb-0.5 flex flex-col overflow-hidden rounded-md border shadow-sm">
      <p className="bg-sidebar p-3 font-medium text-lg">Top activity type</p>
      <Separator />
      <div className=" flex min-h-[200px] flex-1 flex-col items-center gap-2 py-4">
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : formattedData && formattedData.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height={100 + (formattedData?.length ?? 0) * 25}
          >
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={formattedData}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="activity_type"
                  tickLine={false}
                  axisLine={false}
                  hide
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={5}>
                  <LabelList
                    dataKey="activity_type"
                    position="insideLeft"
                    offset={10}
                    className="fill-muted-foreground text-xs"
                    content={({ value, x, y, height, width }) => {
                      const yPos = Number(y) + Number(height) / 2 + 5;

                      return (
                        <text
                          x={width ? Number(x) + 10 : 10}
                          y={yPos}
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
        ) : (
          <p className="text-muted-foreground">No data available</p>
        )}
      </div>
    </div>
  );
};

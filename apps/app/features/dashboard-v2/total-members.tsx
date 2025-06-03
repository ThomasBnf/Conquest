"use client";

import { DateRangePicker } from "@/components/custom/date-range-picker";
import { trpc } from "@/server/client";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Source } from "@conquest/zod/enum/source.enum";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { IntegrationsPicker } from "./integrations-picker";

const chartConfig = {
  Discord: {
    label: "Discord",
    color: "hsl(var(--chart-1))",
  },
  Github: {
    label: "Github",
    color: "hsl(var(--chart-2))",
  },
  Slack: {
    label: "Slack",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

type Props = {
  sources?: Source[];
};

type WeeklyEntry = {
  week: string;
  Discord: string;
  Github: string;
  Slack: string;
};

export const TotalMembers = ({
  sources = ["Discord", "Github", "Slack"],
}: Props) => {
  const { data } = trpc.dashboardV2.totalMembers.useQuery({ sources });

  const parsedData = data as WeeklyEntry[];

  const totalMembers = parsedData?.reduce((sum, entry) => {
    return (
      sum +
      sources.reduce(
        (acc, source) => acc + Number(entry[source as keyof WeeklyEntry] || 0),
        0,
      )
    );
  }, 0);

  return (
    <div className="flex w-full flex-col gap-2 rounded-md border p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-base">Total members over time</p>
        <DateRangePicker />
      </div>
      <div>
        <IntegrationsPicker />
      </div>
      <div className="flex gap-4">
        <ResponsiveContainer width="100%" height={400}>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => format(value, "PP")}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              {sources.map((source) => (
                <Area
                  key={source}
                  type="basis"
                  dataKey={source}
                  stroke={chartConfig[source as keyof typeof chartConfig].color}
                  fill="none"
                />
              ))}
            </AreaChart>
          </ChartContainer>
        </ResponsiveContainer>
        <div className="w-full max-w-xs p-4">
          <div className="mb-4">
            <p className="font-medium text-muted-foreground text-sm">
              Total members
            </p>
            <p className="font-medium text-2xl">{totalMembers || 0}</p>
          </div>
          <div className="space-y-2">
            {sources.map((source) => {
              const sourceTotal =
                parsedData?.reduce(
                  (sum, entry) =>
                    sum + Number(entry[source as keyof WeeklyEntry] || 0),
                  0,
                ) || 0;

              return (
                <div key={source} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-4 rounded-md"
                      style={{
                        backgroundColor:
                          chartConfig[source as keyof typeof chartConfig].color,
                      }}
                    />
                    <p className="font-medium">{source}</p>
                  </div>
                  <p className="font-medium text-base">{sourceTotal}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

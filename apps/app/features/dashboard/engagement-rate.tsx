"use client";

import { IsLoading } from "@/components/states/is-loading";
import { useDateRange } from "@/hooks/useDateRange";
import { trpc } from "@/server/client";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Skeleton } from "@conquest/ui/skeleton";
import { Source } from "@conquest/zod/enum/source.enum";
import { skipToken } from "@tanstack/react-query";
import { format } from "date-fns";
import { ReactNode, useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { DateRangePicker } from "./date-range-picker";
import { getDays } from "./helpers/getDays";
import { getMaxValue } from "./helpers/getMaxValue";
import { IntegrationsPicker } from "./integrations-picker";
import { Percentage } from "./percentage";

type EngagementRateData = {
  week: string;
  [key: string]: string | number;
};

type SourceConfig = {
  label: string;
  color: string;
  logo?: ReactNode;
};

const chartConfig: Record<string, SourceConfig> = {
  Discord: {
    label: "Discord",
    color: "hsl(var(--discord))",
  },
  Discourse: {
    label: "Discourse",
    color: "hsl(var(--discourse))",
  },
  Github: {
    label: "Github",
    color: "hsl(var(--foreground))",
  },
  Livestorm: {
    label: "Livestorm",
    color: "hsl(var(--livestorm))",
  },
  Slack: {
    label: "Slack",
    color: "hsl(var(--slack))",
  },
  Twitter: {
    label: "Twitter",
    color: "hsl(var(--twitter))",
  },
} satisfies ChartConfig;

export const EngagementRate = () => {
  const { globalDateRange } = useDateRange();
  const [sources, setSources] = useState<Source[]>([]);
  const [dateRange, setDateRange] = useState(globalDateRange);

  const { data, isLoading } = trpc.dashboard.engagementRate.useQuery(
    sources.length > 0
      ? {
          dateRange,
          sources,
        }
      : skipToken,
  );

  const { overallRate, periodRate, growthRate } = data ?? {};
  const maxValue = getMaxValue(periodRate as EngagementRateData[], sources);
  const days = getDays(dateRange);
  const dateFormat = days > 30 ? "MMM yyyy" : "MMM dd";

  useEffect(() => {
    setDateRange(globalDateRange);
  }, [globalDateRange]);

  return (
    <div className="flex w-full flex-col gap-4 rounded-md border p-4 shadow-sm">
      <div className="flex justify-between gap-1">
        <p className="font-medium text-lg">Engagement Rate</p>
        <div className="flex items-center gap-2">
          <IntegrationsPicker sources={sources} setSources={setSources} />
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between">
          <div className="space-y-2">
            <p className="text-muted-foreground">Overall engagement rate</p>
            {isLoading ? (
              <Skeleton className="h-8 w-14" />
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-medium text-2xl">{overallRate ?? 0}%</p>
                <Percentage variation={growthRate} isLoading={isLoading} />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Engagement rate by integration
            </p>
            <div>
              {sources.map((source) => (
                <div
                  key={source}
                  className="flex items-center justify-between gap-8"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 rounded"
                      style={{ backgroundColor: chartConfig[source]?.color }}
                    />
                    <p>{source}</p>
                  </div>
                  <p className="font-medium">
                    {periodRate?.at(-1)?.[source]?.toFixed(1) || 0}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          {isLoading ? (
            <IsLoading />
          ) : (
            <ChartContainer config={chartConfig}>
              <LineChart
                data={periodRate}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="week"
                  tickMargin={10}
                  tickFormatter={(value) => format(value, dateFormat)}
                  stroke="#D1D1D1"
                  interval={days === 7 ? "preserveStartEnd" : 4}
                />
                <YAxis
                  axisLine={false}
                  tickMargin={10}
                  stroke="hsl(var(--border))"
                  domain={[0, maxValue]}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(value) => format(value, dateFormat)}
                      formatter={(value, name, item) => {
                        const sourceConfig = chartConfig[name];
                        return (
                          <div className="grid w-full gap-1.5">
                            <div className="flex w-full gap-2">
                              <div
                                className="w-1 shrink-0 rounded-[2px] bg-[--color-bg]"
                                style={
                                  {
                                    "--color-bg": sourceConfig?.color,
                                  } as React.CSSProperties
                                }
                              />
                              <div className="flex flex-1 justify-between leading-none">
                                <div className="grid gap-1.5 pr-2">
                                  <span className="text-muted-foreground">
                                    {sourceConfig?.label || item.name}
                                  </span>
                                </div>
                                <span className="font-medium tabular-nums">
                                  {Number(value).toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                  }
                />
                {sources.map((source) => (
                  <Line
                    key={source}
                    type="bump"
                    dataKey={source}
                    stroke={chartConfig[source]?.color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

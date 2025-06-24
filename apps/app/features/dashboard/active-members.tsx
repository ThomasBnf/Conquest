"use client";

import { TooltipInfo } from "@/components/badges/tooltip-info";
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
import { IntegrationsPicker } from "./integrations-picker";
import { Percentage } from "./percentage";

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

export const ActiveMembers = () => {
  const { globalDateRange } = useDateRange();
  const [sources, setSources] = useState<Source[]>([]);
  const [dateRange, setDateRange] = useState(globalDateRange);

  const { data, isLoading } = trpc.dashboard.activeMembers.useQuery(
    sources.length > 0
      ? {
          dateRange,
          sources,
        }
      : skipToken,
  );

  const { total, growthRate, days } = data ?? {
    total: 0,
    growthRate: 0,
    days: [],
  };

  useEffect(() => {
    setDateRange(globalDateRange);
  }, [globalDateRange]);

  return (
    <div className="flex flex-col gap-4 rounded-md border p-4 shadow-sm">
      <div className="flex justify-between gap-2">
        <p className="font-medium text-lg">Active members</p>
        <div className="flex items-center gap-2">
          <IntegrationsPicker sources={sources} setSources={setSources} />
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Total unique active members</p>
            <TooltipInfo content="A member is counted only once, even if they have profiles on multiple integrations." />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-14" />
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-medium text-2xl">{total ?? 0}</p>
              <Percentage variation={growthRate} isLoading={isLoading} />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground">Active members by integration</p>
          <div className="space-y-0.5">
            {sources.map((source) => (
              <div key={source} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded"
                    style={{ backgroundColor: chartConfig[source]?.color }}
                  />
                  <p>{source}</p>
                </div>
                <p className="font-medium">{days?.at(-1)?.[source] ?? 0}</p>
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
              data={days}
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickMargin={10}
                stroke="#D1D1D1"
                interval="equidistantPreserveStart"
              />
              <YAxis
                axisLine={false}
                tickMargin={10}
                stroke="hsl(var(--border))"
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
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
  );
};

"use client";

import { IsLoading } from "@/components/states/is-loading";
import { trpc } from "@/server/client";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import { Skeleton } from "@conquest/ui/skeleton";
import { Source } from "@conquest/zod/enum/source.enum";
import {
  differenceInDays,
  endOfDay,
  format,
  startOfDay,
  subWeeks,
} from "date-fns";
import { ReactNode, useMemo, useState } from "react";
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

type WeeklyProfileData = {
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

export const ActiveMembers = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subWeeks(startOfDay(new Date()), 4),
    to: endOfDay(new Date()),
  });

  const { from, to } = dateRange;
  const days = differenceInDays(to, from);
  const dateFormat = days > 30 ? "MMM yyyy" : "MMM dd";

  const { data, isLoading } = trpc.dashboardV2.active.useQuery({
    sources,
    from,
    to,
  });

  const profiles = data?.profiles;
  const total = data?.total || 0;

  const maxValue = useMemo(
    () => calculateMaxValue(profiles as WeeklyProfileData[], sources),
    [profiles, sources],
  );

  return (
    <div className="flex flex-col gap-6 rounded-md border p-6 shadow-sm">
      <div className="flex justify-between gap-2">
        <p className="font-semibold text-lg">Active members growth</p>
        <div className="flex items-center gap-1">
          <IntegrationsPicker sources={sources} setSources={setSources} />
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>
      <div className="flex gap-10">
        <div className="mb-4 space-y-2">
          <p className="text-muted-foreground">Total unique active members</p>
          {isLoading ? (
            <Skeleton className="h-8 w-14" />
          ) : (
            <p className="font-medium text-2xl">{total}</p>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground">Active members by integration</p>
          <div>
            {sources.map((source) => (
              <div key={source} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded"
                    style={{ backgroundColor: chartConfig[source]?.color }}
                  />
                  <p>{source}</p>
                </div>
                <p className="font-medium">{profiles?.at(-1)?.[source]}</p>
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
              data={profiles}
              margin={{
                top: 20,
                left: -25,
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
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(value) => format(value, dateFormat)}
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
  );
};

const calculateMaxValue = (
  data: WeeklyProfileData[] | undefined,
  sources: Source[],
): number => {
  if (!data) return 0;

  return data.reduce((max, entry) => {
    const weekMax = sources.reduce((weekMax, source) => {
      const value = Number(entry[source] || 0);
      return Math.max(weekMax, value);
    }, 0);
    return Math.max(max, weekMax);
  }, 0);
};

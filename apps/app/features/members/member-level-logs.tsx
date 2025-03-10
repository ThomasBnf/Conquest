"use client";

import { IconDoc } from "@/components/custom/icon-doc";
import { EmptyStateChart } from "@/components/states/empty-state-chart";
import { trpc } from "@/server/client";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@conquest/ui/chart";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";

const chartConfig = {
  levelNumber: {
    label: "Level",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Props = {
  member: Member;
};

export const MemberLevelLogs = ({ member }: Props) => {
  const { data: logs } = trpc.logs.list.useQuery({
    member_id: member.id,
  });

  const { data: levels } = trpc.levels.list.useQuery();

  const formattedLogs = logs?.map((log) => {
    const level = levels?.find((level) => level.id === log.level_id);

    return {
      date: format(log.date, "MMM d, yyyy"),
      levelNumber: level?.number ?? 0,
      levelName: level?.name,
    };
  });

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <p className="font-medium text-lg">Level Logs</p>
        <IconDoc url="https://docs.useconquest.com/member-level" />
      </div>
      <p className="mb-4 text-muted-foreground">
        Member Level evolution over the past 365 days, logged weekly.
      </p>
      {logs?.length === 0 && <EmptyStateChart />}
      <ResponsiveContainer height={300} className="pr-1">
        <ChartContainer config={chartConfig}>
          <AreaChart data={formattedLogs}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                const { date, levelNumber, levelName } =
                  payload?.[0]?.payload ?? {};

                return (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    label={date}
                    indicator="line"
                    formatter={() => (
                      <div className="flex w-full gap-2">
                        <div className="h-full w-1 shrink-0 rounded-[2px] bg-main-400" />
                        <div className="flex items-end gap-2">
                          <div className="grid gap-1.5">
                            <p className="font-medium leading-none">{date}</p>
                            <p>Level</p>
                          </div>
                          <p>
                            {levelNumber === 0 ? (
                              <span className="text-muted-foreground">
                                No Level
                              </span>
                            ) : (
                              `${levelName} • ${levelNumber}`
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  />
                );
              }}
            />
            <defs>
              <linearGradient id="fill-levelNumber" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <Area
              type="bump"
              dataKey="levelNumber"
              fill="url(#fill-levelNumber)"
              fillOpacity={0.4}
              stroke="hsl(var(--main-300))"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};

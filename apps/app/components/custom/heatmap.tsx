"use client";

import { ACTIVITY_COLORS, WEEKDAYS } from "@/constant";
import { trpc } from "@/server/client";
import { cn } from "@conquest/ui/cn";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import type {
  ActivityHeatmap,
  ActivityWithType,
} from "@conquest/zod/schemas/activity.schema";
import { skipToken } from "@tanstack/react-query";
import {
  addDays,
  format,
  isFirstDayOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  activities: ActivityHeatmap[] | undefined;
  member_id?: string;
};

export const Heatmap = ({ activities, member_id }: Props) => {
  const calendar = generateCalendarGrid();

  return (
    <>
      <ScrollArea>
        <div className="mt-4 flex w-full max-w-0 flex-col">
          <MonthLabels calendar={calendar} />
          <div className="flex gap-1 py-4">
            <div className="mr-2 flex flex-col justify-between text-muted-foreground text-xs">
              {WEEKDAYS.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            {calendar.map((week) => (
              <div
                key={format(week[0] ?? new Date(), "yyyy-MM-dd")}
                className="grid grid-rows-7 gap-1"
              >
                {week.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const dayActivity = activities?.find(
                    (a) => a.date === dateStr,
                  );

                  return (
                    <DayCell
                      key={dateStr}
                      day={day}
                      count={Number(dayActivity?.count ?? 0)}
                      allActivities={activities}
                      member_id={member_id}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="mb-4 ml-9 flex items-center gap-2">
        <p className="text-muted-foreground">Less</p>
        <div className="flex items-center gap-1">
          <div className="size-3.5 rounded bg-main-200" />
          <div className="size-3.5 rounded bg-main-500" />
          <div className="size-3.5 rounded bg-main-700" />
          <div className="size-3.5 rounded bg-black" />
        </div>
        <p className="text-muted-foreground">More</p>
      </div>
    </>
  );
};

type ActivityLevel = 0 | 1 | 2 | 3 | 4;

const getActivityLevel = (
  count: number,
  activities: ActivityHeatmap[] | undefined,
): ActivityLevel => {
  if (count === 0) return 0;

  const nonZeroCounts = activities
    ?.map((a) => Number(a.count))
    .filter((c) => c > 0);

  if (!nonZeroCounts?.length) return 1;

  const sortedCounts = [...nonZeroCounts].sort((a, b) => a - b);
  const q1 = sortedCounts[Math.floor(sortedCounts.length * 0.25)];
  const q2 = sortedCounts[Math.floor(sortedCounts.length * 0.5)];
  const q3 = sortedCounts[Math.floor(sortedCounts.length * 0.75)];

  if (q1 === undefined || q2 === undefined || q3 === undefined) return 1;
  if (count <= q1) return 1;
  if (count <= q2) return 2;
  if (count <= q3) return 3;
  return 4;
};

const generateCalendarGrid = () => {
  const today = new Date();
  const startDate = subDays(today, 365);
  const endDate = today;
  const startOfCalendar = startOfWeek(startDate, { weekStartsOn: 1 });

  const weeks = [];
  let currentWeek = [];
  let currentDate = startOfCalendar;

  while (currentDate <= endDate) {
    currentWeek.push(currentDate);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentDate = addDays(currentDate, 1);
  }

  if (currentWeek.length > 0) weeks.push(currentWeek);

  return weeks;
};

const summarizeActivities = (activities: ActivityWithType[]) =>
  activities.reduce(
    (acc, activity) => {
      const key = activity.activity_type.source;
      if (!acc[key]) {
        acc[key] = { count: 0, activities: new Map() };
      }
      const activityName = activity.activity_type.name;
      acc[key].activities.set(
        activityName,
        (acc[key].activities.get(activityName) || 0) + 1,
      );
      acc[key].count++;
      return acc;
    },
    {} as Record<string, { count: number; activities: Map<string, number> }>,
  );

const ActivitySummaryDisplay = ({
  activities,
}: { activities: ActivityWithType[] }) => {
  const summary = summarizeActivities(activities);

  return (
    <div className="mt-1">
      {Object.entries(summary).map(([source, data]) => (
        <div key={source}>
          <p className="mb-2 font-medium">{source}</p>
          {Array.from(data.activities.entries()).map(([activity, count]) => (
            <p key={activity}>
              {count} <span>x</span> {activity}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

const DayCell = ({
  day,
  count,
  allActivities,
  member_id,
}: {
  day: Date;
  count: number;
  allActivities: ActivityHeatmap[] | undefined;
  member_id?: string;
}) => {
  const [hover, setHover] = useState(false);
  const level = getActivityLevel(count, allActivities);

  const { data: activities, isLoading } =
    trpc.activities.listDayActivities.useQuery(
      hover === true ? { date: day, member_id } : skipToken,
    );

  return (
    <Tooltip>
      <TooltipTrigger
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        asChild
      >
        <div
          className={cn(
            "size-4 cursor-pointer rounded-sm transition-colors duration-200",
            ACTIVITY_COLORS[level],
          )}
        />
      </TooltipTrigger>
      <TooltipContent align="start" side="left">
        {isLoading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <p>{format(day, "MMM d, yyyy")}</p>
            <p className="mt-1">
              {activities?.length ?? 0}{" "}
              {(activities?.length ?? 0) === 1 ? "activity" : "activities"}
            </p>
            {activities && <ActivitySummaryDisplay activities={activities} />}
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

const MonthLabels = ({ calendar }: { calendar: Date[][] }) => {
  const cellWidth = 16;
  const cellGap = 4;
  const weekdayLabelWidth = 32;

  return (
    <div className="relative h-6">
      {calendar.map((week, weekIndex) => {
        const firstDayOfMonth = week.find((day) => isFirstDayOfMonth(day));

        if (firstDayOfMonth) {
          const position =
            weekIndex * (cellWidth + cellGap) + weekdayLabelWidth + 7;
          return (
            <div
              key={firstDayOfMonth.toISOString()}
              className="absolute top-0 text-muted-foreground text-xs"
              style={{ left: `${position}px` }}
            >
              {format(firstDayOfMonth, "MMM")}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

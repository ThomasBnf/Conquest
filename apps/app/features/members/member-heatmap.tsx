"use client";

import { IconDoc } from "@/components/custom/icon-doc";
import { ACTIVITY_COLORS, WEEKDAYS } from "@/constant";
import { trpc } from "@/server/client";
import { cn } from "@conquest/ui/cn";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { Skeleton } from "@conquest/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import {
  addDays,
  format,
  isFirstDayOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";

type Props = {
  memberId: string;
};

export const MemberHeatmap = ({ memberId }: Props) => {
  const calendar = generateCalendarGrid();

  const { data, isLoading } = trpc.activities.list.useQuery({
    member_id: memberId,
  });

  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="font-medium text-lg">Member Heatmap</p>
        <IconDoc url="https://docs.useconquest.com/member-heatmap" />
      </div>
      <p className="mb-4 flex items-center gap-1 text-muted-foreground">
        {isLoading ? (
          <Skeleton className="h-4 w-6" />
        ) : (
          <span>{data?.length}</span>
        )}{" "}
        {data?.length === 1 ? "activity" : "activities"} in the last 365 days
      </p>
      <ScrollArea className="pb-4">
        <div className="flex flex-col">
          <MonthLabels calendar={calendar} />
          <div className="flex">
            <div className="grid grid-flow-col gap-1">
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
                    const dayActivities = data?.filter(
                      (a) => format(a.created_at, "yyyy-MM-dd") === dateStr,
                    );

                    return (
                      <DayCell
                        key={dateStr}
                        day={day}
                        activities={dayActivities}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </div>
      </ScrollArea>
    </div>
  );
};

type ActivityLevel = 0 | 1 | 2 | 3 | 4;

const getActivityLevel = (count: number): ActivityLevel => {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 2) return 2;
  if (count <= 3) return 3;
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
        <div key={source} className="opacity-70">
          <p className="capitalize">{source.toLowerCase()}</p>
          {Array.from(data.activities.entries()).map(([activity, count]) => (
            <p key={activity}>
              {count} {activity}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

const DayCell = ({
  day,
  activities,
}: { day: Date; activities: ActivityWithType[] | undefined }) => {
  const level = getActivityLevel(activities?.length ?? 0);

  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          className={cn(
            "h-4 w-4 cursor-pointer rounded-sm",
            ACTIVITY_COLORS[level],
          )}
        />
      </TooltipTrigger>
      <TooltipContent align="start" side="right">
        <p>{format(day, "MMM d, yyyy")}</p>
        <p className="mt-1">
          {activities?.length ?? 0}{" "}
          {(activities?.length ?? 0) === 1 ? "activity" : "activities"}
        </p>
        {activities && <ActivitySummaryDisplay activities={activities} />}
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
              className="absolute text-muted-foreground text-xs"
              style={{
                left: `${position}px`,
                top: "0",
              }}
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

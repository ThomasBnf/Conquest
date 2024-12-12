"use client";

import { ScrollArea, ScrollBar } from "@conquest/ui/src/components/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@conquest/ui/src/components/tooltip";
import { cn } from "@conquest/ui/src/utils/cn";
import { addDays, endOfYear, format, startOfWeek, startOfYear } from "date-fns";

type Props = {
  activities: {
    created_at: Date;
    _count: number;
  }[];
};

export const MemberHeatmap = ({ activities }: Props) => {
  const activityData = activities.reduce<Record<string, number>>(
    (acc, activity) => {
      const dateStr = format(activity.created_at, "yyyy-MM-dd");
      acc[dateStr] = activity._count;
      return acc;
    },
    {},
  );

  const generateCalendarGrid = () => {
    const today = new Date();
    const startDate = startOfYear(today);
    const endDate = endOfYear(today);
    const startOfCalendar = startOfWeek(startDate);

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

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const getActivityLevel = (count: number): number => {
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 2) return 2;
    if (count <= 3) return 3;
    return 4;
  };

  const getCellColor = (level: 0 | 1 | 2 | 3 | 4): string => {
    const colors = {
      0: "bg-gray-100",
      1: "bg-main-200",
      2: "bg-main-400",
      3: "bg-main-600",
      4: "bg-main-900",
    } as const;
    return colors[level];
  };

  const calendar = generateCalendarGrid();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="p-4">
      <p className="mb-2 font-medium text-lg">Member Heatmap</p>
      <ScrollArea className="pb-4">
        <div className="mb-2 ml-10 text-muted-foreground">
          {months.map((month) => (
            <p key={month} className="inline-block w-[87px] text-xs">
              {month}
            </p>
          ))}
        </div>
        <div className="flex">
          <div className="grid grid-flow-col gap-1">
            <div className="mr-2 flex flex-col justify-between text-muted-foreground text-xs">
              <div>Mon</div>
              <div>Wed</div>
              <div>Fri</div>
              <div>Sun</div>
            </div>
            {calendar.map((week) => (
              <div
                key={format(week[0] ?? new Date(), "yyyy-MM-dd")}
                className="grid grid-rows-7 gap-1"
              >
                {week.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const activities = activityData[dateStr] || 0;
                  const level = getActivityLevel(activities) as
                    | 0
                    | 1
                    | 2
                    | 3
                    | 4;

                  return (
                    <Tooltip key={dateStr}>
                      <TooltipTrigger>
                        <div
                          key={dateStr}
                          className={cn(
                            "h-4 w-4 cursor-pointer rounded-sm",
                            getCellColor(level),
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{format(day, "MMM d, yyyy")}</p>
                        <p>
                          {activities} activit{activities > 1 ? "ies" : "y"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

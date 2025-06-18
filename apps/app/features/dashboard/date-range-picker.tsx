"use client";

import { useDateRange } from "@/hooks/useDateRange";
import { useWorkspace } from "@/hooks/useWorkspace";
import { formatDateRange } from "@/utils/format-date-range";
import { Button } from "@conquest/ui/button";
import { Calendar } from "@conquest/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Skeleton } from "@conquest/ui/skeleton";
import {
  endOfDay,
  isEqual,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { type DateRange } from "react-day-picker";

type Props = {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
};

export const DateRangePicker = ({ dateRange, setDateRange }: Props) => {
  const { globalDateRange } = useDateRange();
  const { workspace, isLoading } = useWorkspace();
  const [open, setOpen] = useState(false);

  const onSelect = (newDate: DateRange) => {
    const { from, to } = newDate;

    if (!from || !to || !workspace) return;

    const { createdAt } = workspace;
    const adjustedFrom = from < createdAt ? createdAt : from;

    setDateRange({ from: startOfDay(adjustedFrom), to });
  };

  const dateRanges = [
    {
      label: "Last 7 days",
      value: "last-7-days",
      from: subDays(startOfDay(new Date()), 7),
      to: endOfDay(new Date()),
    },
    {
      label: "Last 4 weeks",
      value: "last-4-weeks",
      from: subWeeks(startOfDay(new Date()), 4),
      to: endOfDay(new Date()),
    },
    {
      label: "Last 3 months",
      value: "last-3-months",
      from: subMonths(startOfDay(new Date()), 3),
      to: endOfDay(new Date()),
    },
    {
      label: "Month to date",
      value: "month-to-date",
      from: startOfMonth(new Date()),
      to: endOfDay(new Date()),
    },
    {
      label: "Quarter to date",
      value: "quarter-to-date",
      from: startOfQuarter(new Date()),
      to: endOfDay(new Date()),
    },
    {
      label: "Year to date",
      value: "year-to-date",
      from: startOfYear(new Date()),
      to: endOfDay(new Date()),
    },
    {
      label: "All time",
      value: "all-time",
      from: startOfDay(new Date(workspace?.createdAt || new Date())),
      to: endOfDay(new Date()),
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          {isLoading ? (
            <Skeleton className="h-5 w-14" />
          ) : dateRange?.from && dateRange?.to ? (
            formatDateRange(dateRange.from, dateRange.to, {
              includeTime: false,
            })
          ) : (
            "Select date"
          )}
          <ChevronDown size={16} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex gap-4" align="end">
        <div className="flex flex-col gap-1">
          {dateRanges.map((range) => (
            <Button
              key={range.value}
              variant={
                dateRange?.from &&
                dateRange?.to &&
                isEqual(range.from, dateRange.from) &&
                isEqual(range.to, dateRange.to)
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start"
              onClick={() => onSelect(range)}
            >
              {range.label}
            </Button>
          ))}
        </div>
        <div>
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onSelect}
            numberOfMonths={2}
            disabled={(date) => {
              if (workspace && date < subDays(workspace.createdAt, 1)) {
                return true;
              }
              return false;
            }}
            required
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

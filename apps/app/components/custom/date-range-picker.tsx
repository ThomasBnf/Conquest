"use client";

import { formatDateRange } from "@/helpers/format-date-range";
import { dateParams } from "@/lib/searchParamsDate";
import { Button } from "@conquest/ui/button";
import { Calendar } from "@conquest/ui/calendar";
import { cn } from "@conquest/ui/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  isEqual,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { CalendarIcon, CheckIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useState } from "react";

type DateRange = {
  from: Date;
  to: Date;
};

export const DateRangePicker = () => {
  const [open, setOpen] = useState(false);
  const [{ from, to }, setDateParams] = useQueryStates(dateParams);
  const today = new Date();

  const [date, setDate] = useState<DateRange>({ from, to });
  const [month, setMonth] = useState<Date>(today);

  const last7Days = {
    from: startOfDay(subDays(today, 7)),
    to: endOfDay(today),
  };
  const last30Days = {
    from: startOfDay(subDays(today, 30)),
    to: endOfDay(today),
  };
  const last90Days = {
    from: startOfDay(subDays(today, 90)),
    to: endOfDay(today),
  };
  const last180Days = {
    from: startOfDay(subDays(today, 180)),
    to: endOfDay(today),
  };
  const monthToDate = {
    from: startOfMonth(today),
    to: endOfDay(today),
  };
  const lastMonth = {
    from: startOfMonth(subMonths(today, 1)),
    to: endOfMonth(subMonths(today, 1)),
  };
  const yearToDate = {
    from: startOfYear(today),
    to: endOfDay(today),
  };
  const lastYear = {
    from: startOfYear(subYears(today, 1)),
    to: endOfYear(subYears(today, 1)),
  };

  const onSelect = (newDate: DateRange) => {
    setDate(newDate);
    setMonth(newDate.to);
    setDateParams(newDate);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-62 justify-start">
            <CalendarIcon
              size={16}
              className="-ms-1 shrink-0 opacity-40 transition-colors group-hover:text-foreground"
              aria-hidden="true"
            />
            <span className={cn("truncate", !date && "text-muted-foreground")}>
              {date?.from && date.to
                ? formatDateRange(date.from, date.to, { includeTime: false })
                : "Pick a date range"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="flex divide-x p-0">
          <div className="max-w-44 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => onSelect(last7Days)}
            >
              Last 7 days
              {isEqual(date.from, last7Days.from) &&
                isEqual(date.to, last7Days.to) && (
                  <CheckIcon size={16} className="ml-auto" />
                )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => onSelect(last30Days)}
            >
              Last 30 days
              {isEqual(date.from, last30Days.from) &&
                isEqual(date.to, last30Days.to) && (
                  <CheckIcon size={16} className="ml-auto" />
                )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => onSelect(last90Days)}
            >
              Last 90 days
              {isEqual(date.from, last90Days.from) &&
                isEqual(date.to, last90Days.to) && (
                  <CheckIcon size={16} className="ml-auto" />
                )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => onSelect(last180Days)}
            >
              Last 180 days
              {isEqual(date.from, last180Days.from) &&
                isEqual(date.to, last180Days.to) && (
                  <CheckIcon size={16} className="ml-auto" />
                )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => onSelect(monthToDate)}
            >
              Month to date
              {isEqual(date.from, monthToDate.from) &&
                isEqual(date.to, monthToDate.to) && (
                  <CheckIcon size={16} className="ml-auto" />
                )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => onSelect(lastMonth)}
            >
              Last month
              {isEqual(date.from, lastMonth.from) &&
                isEqual(date.to, lastMonth.to) && (
                  <CheckIcon size={16} className="ml-auto" />
                )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => onSelect(yearToDate)}
            >
              Year to date
              {isEqual(date.from, yearToDate.from) &&
                isEqual(date.to, yearToDate.to) && (
                  <CheckIcon size={16} className="ml-auto" />
                )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => onSelect(lastYear)}
            >
              Last year
              {isEqual(date.from, lastYear.from) &&
                isEqual(date.to, lastYear.to) && (
                  <CheckIcon size={16} className="ml-auto" />
                )}
            </Button>
          </div>
          <Calendar
            mode="range"
            selected={date}
            onSelect={(newDate) => {
              if (newDate?.from && newDate?.to) {
                onSelect({ from: newDate.from, to: newDate.to });
              }
            }}
            month={month}
            onMonthChange={setMonth}
            className="p-2"
            disabled={[{ after: today }]}
          />
        </PopoverContent>
      </Popover>
      <Button
        variant={
          isEqual(date.from, last7Days.from) && isEqual(date.to, last7Days.to)
            ? "default"
            : "outline"
        }
        size="sm"
        className="w-full justify-start"
        onClick={() => onSelect(last7Days)}
      >
        7D
      </Button>
      <Button
        variant={
          isEqual(date.from, last30Days.from) && isEqual(date.to, last30Days.to)
            ? "default"
            : "outline"
        }
        size="sm"
        className="w-full justify-start"
        onClick={() => onSelect(last30Days)}
      >
        30D
      </Button>
      <Button
        variant={
          isEqual(date.from, last90Days.from) && isEqual(date.to, last90Days.to)
            ? "default"
            : "outline"
        }
        size="sm"
        className="w-full justify-start"
        onClick={() => onSelect(last90Days)}
      >
        90D
      </Button>
      <Button
        variant={
          isEqual(date.from, last180Days.from) &&
          isEqual(date.to, last180Days.to)
            ? "default"
            : "outline"
        }
        size="sm"
        className="w-full justify-start"
        onClick={() => onSelect(last180Days)}
      >
        180D
      </Button>
      <Button
        variant={
          isEqual(date.from, monthToDate.from) &&
          isEqual(date.to, monthToDate.to)
            ? "default"
            : "outline"
        }
        size="sm"
        className="w-full justify-start"
        onClick={() => onSelect(monthToDate)}
      >
        MTD
      </Button>
      <Button
        variant={
          isEqual(date.from, yearToDate.from) && isEqual(date.to, yearToDate.to)
            ? "default"
            : "outline"
        }
        size="sm"
        className="w-full justify-start"
        onClick={() => onSelect(yearToDate)}
      >
        YTD
      </Button>
    </div>
  );
};

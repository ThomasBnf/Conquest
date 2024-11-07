"use client";

import { formatDateRange } from "@/helpers/format-date-range";
import { Button } from "@conquest/ui/button";
import { Calendar } from "@conquest/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { cn } from "@conquest/ui/utils/cn";
import { endOfDay, isEqual, startOfDay, startOfYear, subDays } from "date-fns";
import { useDateRange } from "hooks/useDateRange";
import { CalendarIcon } from "lucide-react";

export const DateRangePicker = () => {
  const [{ from, to }, setDateRange] = useDateRange();

  const isYesterday =
    isEqual(from, subDays(startOfDay(new Date()), 1)) &&
    isEqual(to, endOfDay(new Date()));

  const isLast7Days =
    isEqual(from, subDays(startOfDay(new Date()), 7)) &&
    isEqual(to, endOfDay(new Date()));

  const isLast30Days =
    isEqual(from, subDays(startOfDay(new Date()), 30)) &&
    isEqual(to, endOfDay(new Date()));

  const isLast90Days =
    isEqual(from, subDays(startOfDay(new Date()), 90)) &&
    isEqual(to, endOfDay(new Date()));

  const isYearToDate =
    isEqual(from, startOfYear(new Date())) && isEqual(to, endOfDay(new Date()));

  const onUpdateDateRange = async (from: Date, to: Date) => {
    setDateRange({ from, to });
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn("justify-start text-left font-normal")}
          >
            <CalendarIcon size={16} className="text-muted-foreground" />
            {formatDateRange(from, to, { includeTime: false })}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={from}
            selected={{ from, to }}
            onSelect={(range) => {
              setDateRange({
                from: range?.from ?? null,
                to: range?.to ?? null,
              });
            }}
            numberOfMonths={2}
            disabled={(date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>
      <Button
        variant={isYesterday ? "default" : "outline"}
        className="justify-start"
        onClick={() =>
          onUpdateDateRange(
            subDays(startOfDay(new Date()), 1),
            endOfDay(new Date()),
          )
        }
      >
        Yesterday
      </Button>
      <Button
        variant={isLast7Days ? "default" : "outline"}
        className="justify-start"
        onClick={() =>
          onUpdateDateRange(
            subDays(startOfDay(new Date()), 7),
            endOfDay(new Date()),
          )
        }
      >
        7D
      </Button>
      <Button
        variant={isLast30Days ? "default" : "outline"}
        className="justify-start"
        onClick={() =>
          onUpdateDateRange(
            subDays(startOfDay(new Date()), 30),
            endOfDay(new Date()),
          )
        }
      >
        30D
      </Button>
      <Button
        variant={isLast90Days ? "default" : "outline"}
        className="justify-start"
        onClick={() =>
          onUpdateDateRange(
            subDays(startOfDay(new Date()), 90),
            endOfDay(new Date()),
          )
        }
      >
        90D
      </Button>
      <Button
        variant={isYearToDate ? "default" : "outline"}
        className="justify-start"
        onClick={() =>
          onUpdateDateRange(startOfYear(new Date()), endOfDay(new Date()))
        }
      >
        Year to date
      </Button>
    </div>
  );
};

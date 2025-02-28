"use client";

import { formatDateRange } from "@/helpers/format-date-range";
import { dateParser } from "@/lib/searchParamsDate";
import { Button } from "@conquest/ui/button";
import { Calendar } from "@conquest/ui/calendar";
import { cn } from "@conquest/ui/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { endOfDay, isEqual, startOfDay, startOfYear, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useQueryStates } from "nuqs";

export const DateRangePicker = () => {
  const [{ from, to }, setDateParams] = useQueryStates(dateParser);

  const isLast7Days =
    isEqual(from, subDays(startOfDay(new Date()), 6)) &&
    isEqual(to, endOfDay(new Date()));

  const isLast30Days =
    isEqual(from, subDays(startOfDay(new Date()), 29)) &&
    isEqual(to, endOfDay(new Date()));

  const isLast90Days =
    isEqual(from, subDays(startOfDay(new Date()), 89)) &&
    isEqual(to, endOfDay(new Date()));

  const isLast365Days =
    isEqual(from, subDays(startOfDay(new Date()), 364)) &&
    isEqual(to, endOfDay(new Date()));

  const isYearToDate =
    isEqual(from, startOfYear(new Date())) && isEqual(to, endOfDay(new Date()));

  const onUpdateDateRange = async (from: Date, to: Date) => {
    setDateParams({ from, to });
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
              setDateParams({
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
        variant={isLast7Days ? "default" : "outline"}
        className="justify-start"
        onClick={() =>
          onUpdateDateRange(
            subDays(startOfDay(new Date()), 6),
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
            subDays(startOfDay(new Date()), 29),
            startOfDay(new Date()),
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
            subDays(startOfDay(new Date()), 89),
            endOfDay(new Date()),
          )
        }
      >
        90D
      </Button>
      <Button
        variant={isLast365Days ? "default" : "outline"}
        className="justify-start"
        onClick={() =>
          onUpdateDateRange(
            subDays(startOfDay(new Date()), 364),
            endOfDay(new Date()),
          )
        }
      >
        365D
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

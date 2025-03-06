"use client";

import { formatDateRange } from "@/helpers/format-date-range";
import { useDateRange } from "@/hooks/useDateRange";
import { Button } from "@conquest/ui/button";
import { Calendar } from "@conquest/ui/calendar";
import { cn } from "@conquest/ui/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

export const DatePicker = () => {
  const {
    date,
    setDate,
    today,
    month,
    setMonth,
    yesterday,
    last7Days,
    last30Days,
    monthToDate,
    lastMonth,
    yearToDate,
    lastYear,
  } = useDateRange();

  const [open, setOpen] = useState(false);

  return (
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
            onClick={() => {
              setDate({
                from: today,
                to: today,
              });
              setMonth(today);
              setOpen(false);
            }}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setDate(yesterday);
              setMonth(yesterday.to);
              setOpen(false);
            }}
          >
            Yesterday
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setDate(last7Days);
              setMonth(last7Days.to);
              setOpen(false);
            }}
          >
            Last 7 days
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setDate(last30Days);
              setMonth(last30Days.to);
              setOpen(false);
            }}
          >
            Last 30 days
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setDate(monthToDate);
              setMonth(monthToDate.to);
              setOpen(false);
            }}
          >
            Month to date
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setDate(lastMonth);
              setMonth(lastMonth.to);
              setOpen(false);
            }}
          >
            Last month
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setDate(yearToDate);
              setMonth(yearToDate.to);
              setOpen(false);
            }}
          >
            Year to date
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setDate(lastYear);
              setMonth(lastYear.to);
              setOpen(false);
            }}
          >
            Last year
          </Button>
        </div>
        <Calendar
          mode="range"
          selected={date}
          onSelect={(newDate) => {
            if (newDate?.from && newDate?.to) {
              setDate({ from: newDate.from, to: newDate.to });
              setOpen(false);
            }
          }}
          month={month}
          onMonthChange={setMonth}
          className="p-2"
          disabled={[{ after: today }]}
        />
      </PopoverContent>
    </Popover>
  );
};

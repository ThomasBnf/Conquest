"use client";

import { Button } from "@conquest/ui/button";
import { Calendar } from "@conquest/ui/calendar";
import { cn } from "@conquest/ui/utils/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { formatDateRange } from "helpers/format-date-range";
import { useDateRange } from "hooks/useDateRange";
import { Calendar as CalendarIcon } from "lucide-react";
import { date } from "zod";

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  classNameButton?: string;
  align?: "start" | "end";
}

export const DateRange = ({
  className,
  classNameButton,
  align = "start",
}: DateRangePickerProps) => {
  const [{ from, to }, setDateRange] = useDateRange();

  return (
    <div className={cn(className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground",
              classNameButton,
            )}
          >
            <CalendarIcon size={16} className="text-muted-foreground" />
            {formatDateRange(from, to, { includeTime: false })}
          </Button>
        </PopoverTrigger>
        <PopoverContent align={align}>
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
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

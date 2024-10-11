"use client";

import { DateRange } from "@/components/custom/date-range";
import { useDateRange } from "@/hooks/useDateRange";
import { Button } from "@conquest/ui/button";
import { endOfDay, isEqual, startOfDay, subDays } from "date-fns";

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

  const onUpdateDateRange = (from: Date | null, to: Date | null) => {
    setDateRange({ from, to });
    // updateUser({ date_range: { from, to } });
  };

  return (
    <div className="flex items-center gap-2">
      <DateRange align="end" />
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
    </div>
  );
};

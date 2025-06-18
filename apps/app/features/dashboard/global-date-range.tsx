"use client";

import { useDateRange } from "@/hooks/useDateRange";
import { endOfDay, startOfDay, subWeeks } from "date-fns";
import { useEffect } from "react";
import type { DateRange } from "react-day-picker";
import { DateRangePicker } from "./date-range-picker";

export const GlobalDateRange = () => {
  const { globalDateRange, setGlobalDateRange } = useDateRange();

  const onSelect = (newDate: DateRange) => {
    const { from, to } = newDate;

    if (!from || !to) return;

    setGlobalDateRange({ from: startOfDay(from), to });
  };

  useEffect(() => {
    if (!globalDateRange) {
      onSelect({
        from: subWeeks(startOfDay(new Date()), 4),
        to: endOfDay(new Date()),
      });
    }
  }, []);

  return (
    <DateRangePicker
      dateRange={globalDateRange}
      setDateRange={setGlobalDateRange}
    />
  );
};

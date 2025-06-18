"use client";

import { useDateRange } from "@/hooks/useDateRange";
import { useWorkspace } from "@/hooks/useWorkspace";
import { endOfDay, startOfDay, subWeeks } from "date-fns";
import { useEffect } from "react";
import type { DateRange } from "react-day-picker";
import { DateRangePicker } from "./date-range-picker";

export const GlobalDateRange = () => {
  const { globalDateRange, setGlobalDateRange } = useDateRange();
  const { workspace } = useWorkspace();

  const onSelect = (newDate: DateRange) => {
    const { from, to } = newDate;

    if (!from || !to || !workspace) return;

    const { createdAt } = workspace;
    const adjustedFrom = from < createdAt ? createdAt : from;

    setGlobalDateRange({ from: startOfDay(adjustedFrom), to });
  };

  useEffect(() => {
    if (!globalDateRange) {
      onSelect({
        from: subWeeks(startOfDay(new Date()), 4),
        to: endOfDay(new Date()),
      });
    }
  }, [workspace]);

  return (
    <DateRangePicker
      dateRange={globalDateRange}
      setDateRange={setGlobalDateRange}
    />
  );
};

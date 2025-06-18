import type { DateRange } from "react-day-picker";
import { create } from "zustand";

type Props = {
  globalDateRange: DateRange | undefined;
  setGlobalDateRange: (dateRange: DateRange | undefined) => void;
};

export const useDateRange = create<Props>((set) => ({
  globalDateRange: undefined,
  setGlobalDateRange: (globalDateRange) => set({ globalDateRange }),
}));

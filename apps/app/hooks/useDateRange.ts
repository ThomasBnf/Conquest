import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { create } from "zustand";

type DateRange = {
  from: Date;
  to: Date;
};

type Props = {
  date: DateRange;
  setDate: (date: DateRange) => void;
  month: Date;
  setMonth: (month: Date) => void;
  today: Date;
  yesterday: DateRange;
  last7Days: DateRange;
  last30Days: DateRange;
  monthToDate: DateRange;
  lastMonth: DateRange;
  yearToDate: DateRange;
  lastYear: DateRange;
};

const today = new Date();

const yesterday = {
  from: subDays(today, 1),
  to: subDays(today, 1),
};
const last7Days = {
  from: subDays(today, 6),
  to: today,
};
const last30Days = {
  from: subDays(today, 29),
  to: today,
};
const monthToDate = {
  from: startOfMonth(today),
  to: today,
};
const lastMonth = {
  from: startOfMonth(subMonths(today, 1)),
  to: endOfMonth(subMonths(today, 1)),
};
const yearToDate = {
  from: startOfYear(today),
  to: today,
};
const lastYear = {
  from: startOfYear(subYears(today, 1)),
  to: endOfYear(subYears(today, 1)),
};

export const useDateRange = create<Props>((set) => ({
  date: lastMonth,
  setDate: (date) => set({ date }),
  month: today,
  setMonth: (month) => set({ month }),
  today,
  yesterday,
  last7Days,
  last30Days,
  monthToDate,
  lastMonth,
  yearToDate,
  lastYear,
}));

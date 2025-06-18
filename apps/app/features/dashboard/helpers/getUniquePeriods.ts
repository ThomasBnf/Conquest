import {
  addDays,
  addWeeks,
  differenceInDays,
  format,
  startOfWeek,
} from "date-fns";

export const getUniquePeriods = (from: Date, to: Date) => {
  const days = differenceInDays(to, from);
  const isWeekly = days > 30;

  const periods: string[] = [];
  let current = from;

  while (current <= to) {
    if (isWeekly) {
      periods.push(format(startOfWeek(current), "yyyy-MM-dd"));
      current = addWeeks(current, 1);
    } else {
      periods.push(format(current, "yyyy-MM-dd"));
      current = addDays(current, 1);
    }
  }

  return [...new Set(periods)];
};

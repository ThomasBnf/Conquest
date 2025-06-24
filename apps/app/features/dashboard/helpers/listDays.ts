import { addDays, endOfDay, format } from "date-fns";

export const listDays = (from: Date | undefined, to: Date | undefined) => {
  if (!from || !to) return [];

  const periods: string[] = [];
  let current = from;

  const endDate = endOfDay(new Date(to));

  while (current < endDate) {
    periods.push(format(current, "MMM dd"));
    current = addDays(current, 1);
  }

  return [...new Set(periods)];
};

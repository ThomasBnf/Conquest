import type { Activity } from "@conquest/zod/schemas/activity.schema";
import { format, getQuarter, getYear } from "date-fns";

export const getMemberPresence = (activities: Activity[]) => {
  const activitiesByWeek = new Map<string, Set<string>>();
  const activitiesByMonth = new Map<string, Set<string>>();
  const activitiesByQuarter = new Map<string, Set<string>>();

  for (const activity of activities) {
    const date = activity.created_at;
    const day = format(date, "yyyy-MM-dd");
    const week = format(date, "yyyy-'W'II", {
      useAdditionalWeekYearTokens: true,
    });
    const month = format(date, "yyyy-M");
    const quarter = `${getYear(date)}-Q${getQuarter(date)}`;

    const weekSet = activitiesByWeek.get(week) ?? new Set<string>();
    const monthSet = activitiesByMonth.get(month) ?? new Set<string>();
    const quarterSet = activitiesByQuarter.get(quarter) ?? new Set<string>();

    weekSet.add(day);
    monthSet.add(day);
    quarterSet.add(day);

    activitiesByWeek.set(week, weekSet);
    activitiesByMonth.set(month, monthSet);
    activitiesByQuarter.set(quarter, quarterSet);
  }

  const activeWeeks = Array.from(activitiesByWeek.values()).filter(
    (days) => days.size >= 2,
  ).length;

  const activeMonths = Array.from(activitiesByMonth.values()).filter(
    (days) => days.size >= 7,
  ).length;

  const activeQuarters = Array.from(activitiesByQuarter.values()).filter(
    (days) => days.size >= 30,
  ).length;

  if (activeQuarters >= 3) return 12;
  if (activeQuarters >= 2) return 11;
  if (activeQuarters >= 1) return 10;
  if (activeMonths >= 3) return 9;
  if (activeMonths >= 2) return 8;
  if (activeMonths >= 1) return 7;
  if (activeWeeks >= 3) return 6;
  if (activeWeeks >= 2) return 5;
  if (activeWeeks >= 1) return 4;

  return 0;
};

import type { Activity } from "@conquest/zod/schemas/activity.schema";
import {
  format,
  getQuarter,
  getYear,
  subMonths,
  subQuarters,
  subWeeks,
} from "date-fns";

export const getMemberPresence = (
  activities: Activity[],
  referenceDate: Date,
): number => {
  const activitiesByWeek = new Map<string, Set<string>>();
  const activitiesByMonth = new Map<string, Set<string>>();
  const activitiesByQuarter = new Map<string, Set<string>>();

  // Calculer les périodes de référence
  const threeWeeksAgo = subWeeks(referenceDate, 2); // Pour inclure les 3 dernières semaines
  const threeMonthsAgo = subMonths(referenceDate, 2);
  const threeQuartersAgo = subQuarters(referenceDate, 2);

  // Filtrer les activités pertinentes
  const relevantActivities = activities.filter((activity) => {
    const date = activity.created_at;
    return (
      date <= referenceDate &&
      (date >= threeWeeksAgo ||
        date >= threeMonthsAgo ||
        date >= threeQuartersAgo)
    );
  });

  // Organiser les activités par période
  for (const activity of relevantActivities) {
    const date = activity.created_at;
    const day = format(date, "yyyy-MM-dd");
    const week = format(date, "yyyy-'W'II");
    const month = format(date, "yyyy-MM");
    const quarter = `${getYear(date)}-Q${getQuarter(date)}`;

    if (!activitiesByWeek.has(week)) activitiesByWeek.set(week, new Set());
    if (!activitiesByMonth.has(month)) activitiesByMonth.set(month, new Set());
    if (!activitiesByQuarter.has(quarter))
      activitiesByQuarter.set(quarter, new Set());

    activitiesByWeek.get(week)!.add(day);
    activitiesByMonth.get(month)!.add(day);
    activitiesByQuarter.get(quarter)!.add(day);
  }

  const weekEntries = Array.from(activitiesByWeek.entries())
    .filter(([_, days]) => days.size > 0)
    .sort();
  const monthEntries = Array.from(activitiesByMonth.entries())
    .filter(([_, days]) => days.size > 0)
    .sort();
  const quarterEntries = Array.from(activitiesByQuarter.entries())
    .filter(([_, days]) => days.size > 0)
    .sort();

  // Vérifier les conditions avec la date de référence
  if (
    quarterEntries.length >= 3 &&
    quarterEntries.slice(-3).every(([_, days]) => days.size >= 30)
  )
    return 12;

  if (
    quarterEntries.length >= 2 &&
    quarterEntries.slice(-2).every(([_, days]) => days.size >= 30)
  )
    return 11;

  if (
    quarterEntries.length >= 1 &&
    (quarterEntries.at(-1)?.[1]?.size ?? 0) >= 30
  )
    return 10;

  if (
    monthEntries.length >= 3 &&
    monthEntries.slice(-3).every(([_, days]) => days.size >= 7)
  )
    return 9;

  if (
    monthEntries.length >= 2 &&
    monthEntries.slice(-2).every(([_, days]) => days.size >= 7)
  )
    return 8;

  if (monthEntries.length >= 1 && (monthEntries.at(-1)?.[1]?.size ?? 0) >= 7)
    return 7;

  if (
    weekEntries.length >= 3 &&
    weekEntries.slice(-3).every(([_, days]) => days.size >= 2)
  )
    return 6;

  if (
    weekEntries.length >= 2 &&
    weekEntries.slice(-2).every(([_, days]) => days.size >= 2)
  )
    return 5;

  if (weekEntries.length >= 1 && (weekEntries.at(-1)?.[1]?.size ?? 0) >= 2)
    return 4;

  return 0;
};

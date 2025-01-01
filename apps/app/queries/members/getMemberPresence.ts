import type { Activity } from "@conquest/zod/schemas/activity.schema";
import {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  subMonths,
  subQuarters,
  subWeeks,
} from "date-fns";

type TimeInterval = {
  start: Date;
  end: Date;
};

export const getMemberPresence = (
  activities: Activity[],
  currentDate: Date,
): number => {
  const activitiesDates = activities.map((activity) =>
    startOfDay(new Date(activity.created_at)),
  );

  const intervals = calculateIntervals(currentDate);

  const counts: PresenceCounts = {
    daysInPreviousWeek: countActivitiesInInterval(
      activitiesDates,
      intervals.week,
    ),
    daysInPrevious2Weeks: countActivitiesInInterval(
      activitiesDates,
      intervals.week2,
    ),
    daysInPrevious3Weeks: countActivitiesInInterval(
      activitiesDates,
      intervals.week3,
    ),
    daysInPreviousMonth: countActivitiesInInterval(
      activitiesDates,
      intervals.month,
    ),
    daysInPrevious2Months: countActivitiesInInterval(
      activitiesDates,
      intervals.month2,
    ),
    daysInPrevious3Months: countActivitiesInInterval(
      activitiesDates,
      intervals.month3,
    ),
    daysInPreviousQuarter: countActivitiesInInterval(
      activitiesDates,
      intervals.quarter,
    ),
    daysInPrevious2Quarters: countActivitiesInInterval(
      activitiesDates,
      intervals.quarter2,
    ),
    daysInPrevious3Quarters: countActivitiesInInterval(
      activitiesDates,
      intervals.quarter3,
    ),
  };

  return getMemberLevel(counts);
};

type PresenceCounts = {
  daysInPreviousWeek: number;
  daysInPrevious2Weeks: number;
  daysInPrevious3Weeks: number;
  daysInPreviousMonth: number;
  daysInPrevious2Months: number;
  daysInPrevious3Months: number;
  daysInPreviousQuarter: number;
  daysInPrevious2Quarters: number;
  daysInPrevious3Quarters: number;
};

const THRESHOLDS = {
  WEEKLY: 2,
  MONTHLY: 7,
  QUARTERLY: 30,
} as const;

const LEVEL_CONDITIONS = [
  {
    level: 12,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousQuarter >= THRESHOLDS.QUARTERLY &&
      counts.daysInPrevious2Quarters >= THRESHOLDS.QUARTERLY &&
      counts.daysInPrevious3Quarters >= THRESHOLDS.QUARTERLY,
  },
  {
    level: 11,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousQuarter >= THRESHOLDS.QUARTERLY &&
      counts.daysInPrevious2Quarters >= THRESHOLDS.QUARTERLY,
  },
  {
    level: 10,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousQuarter >= THRESHOLDS.QUARTERLY,
  },
  {
    level: 9,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousMonth >= THRESHOLDS.MONTHLY &&
      counts.daysInPrevious2Months >= THRESHOLDS.MONTHLY &&
      counts.daysInPrevious3Months >= THRESHOLDS.MONTHLY,
  },
  {
    level: 8,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousMonth >= THRESHOLDS.MONTHLY &&
      counts.daysInPrevious2Months >= THRESHOLDS.MONTHLY,
  },
  {
    level: 7,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousMonth >= THRESHOLDS.MONTHLY,
  },
  {
    level: 6,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousWeek >= THRESHOLDS.WEEKLY &&
      counts.daysInPrevious2Weeks >= THRESHOLDS.WEEKLY &&
      counts.daysInPrevious3Weeks >= THRESHOLDS.WEEKLY,
  },
  {
    level: 5,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousWeek >= THRESHOLDS.WEEKLY &&
      counts.daysInPrevious2Weeks >= THRESHOLDS.WEEKLY,
  },
  {
    level: 4,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousWeek >= THRESHOLDS.WEEKLY,
  },
] as const;

const getTimeInterval = (start: Date, end: Date): TimeInterval => ({
  start: startOfDay(start),
  end: startOfDay(end),
});

const countActivitiesInInterval = (
  activities: Array<Date>,
  interval: TimeInterval,
): number => {
  const uniqueDays = new Set(
    activities
      .filter((date) => isWithinInterval(date, interval))
      .map((date) => date.toISOString().split("T")[0]),
  );
  return uniqueDays.size;
};

const calculateIntervals = (currentDate: Date) => {
  const weekOptions = { weekStartsOn: 1 as const };

  const week = {
    start: startOfWeek(currentDate, weekOptions),
    end: endOfWeek(currentDate, weekOptions),
  };

  const week2 = {
    start: startOfWeek(subWeeks(week.start, 1), weekOptions),
    end: endOfWeek(subWeeks(week.end, 1), weekOptions),
  };

  const week3 = {
    start: startOfWeek(subWeeks(week2.start, 1), weekOptions),
    end: endOfWeek(subWeeks(week2.end, 1), weekOptions),
  };

  const month = {
    start: startOfMonth(subMonths(currentDate, 1)),
    end: endOfMonth(subMonths(currentDate, 1)),
  };

  const month2 = {
    start: startOfMonth(subMonths(month.start, 1)),
    end: endOfMonth(subMonths(month.end, 1)),
  };

  const month3 = {
    start: startOfMonth(subMonths(month2.start, 1)),
    end: endOfMonth(subMonths(month2.end, 1)),
  };

  const quarter = {
    start: startOfQuarter(subQuarters(currentDate, 1)),
    end: endOfQuarter(subQuarters(currentDate, 1)),
  };

  const quarter2 = {
    start: startOfQuarter(subQuarters(quarter.start, 1)),
    end: endOfQuarter(subQuarters(quarter.end, 1)),
  };

  const quarter3 = {
    start: startOfQuarter(subQuarters(quarter2.start, 1)),
    end: endOfQuarter(subQuarters(quarter2.end, 1)),
  };

  return {
    week: getTimeInterval(week.start, week.end),
    week2: getTimeInterval(week2.start, week2.end),
    week3: getTimeInterval(week3.start, week3.end),
    month: getTimeInterval(month.start, month.end),
    month2: getTimeInterval(month2.start, month2.end),
    month3: getTimeInterval(month3.start, month3.end),
    quarter: getTimeInterval(quarter.start, quarter.end),
    quarter2: getTimeInterval(quarter2.start, quarter2.end),
    quarter3: getTimeInterval(quarter3.start, quarter3.end),
  };
};

const getMemberLevel = (counts: PresenceCounts): number => {
  const matchingCondition = LEVEL_CONDITIONS.find(({ check }) => check(counts));
  return matchingCondition?.level ?? 0;
};

import { dateParams } from "@/lib/dateParams";
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  isEqual,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { useQueryStates } from "nuqs";

export const PeriodFormatter = () => {
  const today = new Date();

  const [{ from, to }] = useQueryStates(dateParams);

  const last7Days = {
    from: startOfDay(subDays(today, 7)),
    to: endOfDay(today),
  };
  const last30Days = {
    from: startOfDay(subDays(today, 30)),
    to: endOfDay(today),
  };
  const last90Days = {
    from: startOfDay(subDays(today, 90)),
    to: endOfDay(today),
  };
  const last180Days = {
    from: startOfDay(subDays(today, 180)),
    to: endOfDay(today),
  };
  const monthToDate = {
    from: startOfMonth(today),
    to: endOfDay(today),
  };
  const lastMonth = {
    from: startOfMonth(subMonths(today, 1)),
    to: endOfMonth(subMonths(today, 1)),
  };
  const yearToDate = {
    from: startOfYear(today),
    to: endOfDay(today),
  };
  const lastYear = {
    from: startOfYear(subYears(today, 1)),
    to: endOfYear(subYears(today, 1)),
  };

  let period = "";

  if (isEqual(from, last7Days.from) && isEqual(to, last7Days.to)) {
    period = "Last 7 days";
  }

  if (isEqual(from, last30Days.from) && isEqual(to, last30Days.to)) {
    period = "Last 30 days";
  }

  if (isEqual(from, last90Days.from) && isEqual(to, last90Days.to)) {
    period = "Last 90 days";
  }

  if (isEqual(from, last180Days.from) && isEqual(to, last180Days.to)) {
    period = "Last 180 days";
  }

  if (isEqual(from, monthToDate.from) && isEqual(to, monthToDate.to)) {
    period = "Month to date";
  }

  if (isEqual(from, lastMonth.from) && isEqual(to, lastMonth.to)) {
    period = "Last month";
  }

  if (isEqual(from, yearToDate.from) && isEqual(to, yearToDate.to)) {
    period = "Year to date";
  }

  if (isEqual(from, lastYear.from) && isEqual(to, lastYear.to)) {
    period = "Last year";
  }

  return <p className="text-muted-foreground">{period}</p>;
};

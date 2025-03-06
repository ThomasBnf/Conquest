import { useDateRange } from "@/hooks/useDateRange";

export const TimeFormat = () => {
  const {
    date,
    today,
    yesterday,
    last7Days,
    last30Days,
    monthToDate,
    lastMonth,
    yearToDate,
    lastYear,
  } = useDateRange();

  const { from, to } = date;

  if (from === today && to === today) {
    return <p className="text-muted-foreground">Today</p>;
  }

  if (from === yesterday.from && to === yesterday.to) {
    return <p className="text-muted-foreground">Yesterday</p>;
  }

  if (from === last7Days.from && to === last7Days.to) {
    return <p className="text-muted-foreground">Last 7 days</p>;
  }

  if (from === last30Days.from && to === last30Days.to) {
    return <p className="text-muted-foreground">Last 30 days</p>;
  }

  if (from === monthToDate.from && to === monthToDate.to) {
    return <p className="text-muted-foreground">Month to date</p>;
  }

  if (from === lastMonth.from && to === lastMonth.to) {
    return <p className="text-muted-foreground">Last month</p>;
  }

  if (from === yearToDate.from && to === yearToDate.to) {
    return <p className="text-muted-foreground">Year to date</p>;
  }

  if (from === lastYear.from && to === lastYear.to) {
    return <p className="text-muted-foreground">Last year</p>;
  }
};

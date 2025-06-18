import { differenceInDays } from "date-fns";
import { type DateRange } from "react-day-picker";

export const getDays = (dateRange: DateRange | undefined) => {
  if (!dateRange?.from || !dateRange?.to) return 0;

  return differenceInDays(dateRange.to, dateRange.from);
};

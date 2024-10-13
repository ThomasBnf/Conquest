import { endOfDay, startOfDay, subDays } from "date-fns";
import { parseAsIsoDateTime, useQueryStates } from "nuqs";

export const useDateRange = () => {
  return useQueryStates(
    {
      from: parseAsIsoDateTime.withDefault(subDays(startOfDay(new Date()), 30)),
      to: parseAsIsoDateTime.withDefault(endOfDay(new Date())),
    },
    { shallow: false },
  );
};

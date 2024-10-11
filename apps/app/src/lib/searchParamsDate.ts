import { endOfDay, startOfDay, subDays } from "date-fns";
import { parseAsIsoDateTime } from "nuqs";
import { createSearchParamsCache } from "nuqs/server";

export const searchParamsDate = createSearchParamsCache({
  from: parseAsIsoDateTime.withDefault(subDays(startOfDay(new Date()), 30)),
  to: parseAsIsoDateTime.withDefault(endOfDay(new Date())),
});

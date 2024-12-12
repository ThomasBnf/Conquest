import { endOfDay, startOfDay, subDays } from "date-fns";
import { parseAsIsoDateTime } from "nuqs";
import { createSearchParamsCache } from "nuqs/server";

export const dateParser = {
  from: parseAsIsoDateTime
    .withDefault(subDays(startOfDay(new Date()), 90))
    .withOptions({
      shallow: false,
      clearOnDefault: true,
    }),
  to: parseAsIsoDateTime.withDefault(endOfDay(new Date())).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
};

export const searchParamsDate = createSearchParamsCache(dateParser);

import { endOfDay, startOfDay, subDays } from "date-fns";
import { createLoader, parseAsIsoDateTime } from "nuqs/server";

const today = new Date();

export const dateParams = {
  from: parseAsIsoDateTime
    .withDefault(startOfDay(subDays(today, 30)))
    .withOptions({
      shallow: false,
      clearOnDefault: true,
    }),
  to: parseAsIsoDateTime.withDefault(endOfDay(today)).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
};

export const loaderDate = createLoader(dateParams);

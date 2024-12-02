import { parseAsBoolean, parseAsInteger, parseAsString } from "nuqs";
import { createSearchParamsCache } from "nuqs/server";

export const tableParsers = {
  search: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  id: parseAsString.withDefault("full_name").withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  desc: parseAsBoolean.withDefault(true).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  page: parseAsInteger.withDefault(1).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  pageSize: parseAsInteger.withDefault(50).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
};

export const searchParamsTable = createSearchParamsCache(tableParsers);

import { FilterSchema } from "@conquest/zod/schemas/filters.schema";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
} from "nuqs";
import { createSearchParamsCache } from "nuqs/server";

export const tableParsers = {
  search: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  idMember: parseAsString.withDefault("level").withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  idCompany: parseAsString.withDefault("name").withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  descMember: parseAsBoolean.withDefault(true).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  descCompany: parseAsBoolean.withDefault(false).withOptions({
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
  filters: parseAsArrayOf(FilterSchema).withDefault([]).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
};

export const searchParamsTable = createSearchParamsCache(tableParsers);

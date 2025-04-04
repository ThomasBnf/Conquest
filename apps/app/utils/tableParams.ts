import { FilterSchema } from "@conquest/zod/schemas/filters.schema";
import {
  createLoader,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
} from "nuqs/server";

export const tableMembersParams = {
  search: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  id: parseAsString.withDefault("level").withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  desc: parseAsBoolean.withDefault(true).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  filters: parseAsArrayOf(FilterSchema).withDefault([]).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
};

export const loaderTableMembers = createLoader(tableMembersParams);

export const tableCompaniesParams = {
  search: parseAsString.withDefault("").withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  id: parseAsString.withDefault("name").withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  desc: parseAsBoolean.withDefault(false).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
  filters: parseAsArrayOf(FilterSchema).withDefault([]).withOptions({
    shallow: false,
    clearOnDefault: true,
  }),
};

export const loaderTableCompanies = createLoader(tableCompaniesParams);

import { parseAsBoolean, parseAsString } from "nuqs";
import { createSearchParamsCache } from "nuqs/server";

export const searchParamsMembers = createSearchParamsCache({
  id: parseAsString.withDefault("full_name"),
  desc: parseAsBoolean.withDefault(false),
  search: parseAsString.withDefault(""),
});

import type { Operator } from "@conquest/zod/filters.schema";

export const OPERATORS: Operator[] = [
  "contains",
  "not_contains",
  ">",
  ">=",
  "=",
  "!=",
  "<=",
  "<",
];

import type { Operator } from "@conquest/zod/filters.schema";

export const OPERATORS: Operator[] = [
  "contains",
  "not_contains",
  "greater",
  "greater or equal",
  "equal",
  "not equal",
  "less or equal",
  "less",
];

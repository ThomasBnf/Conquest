import type { Operator } from "schemas/filters.schema";

export const OPERATORS: Operator[] = [
  "is",
  "is_not",
  "contains",
  "not_contains",
  "before",
  "after",
  "equals",
  "not_equals",
  "less_than",
  "greater_than",
];

import type { Filter } from "@conquest/zod/schemas/filters.schema";

export const operatorParser = (operator: Filter["operator"]) => {
  if (operator === "greater") return ">";
  if (operator === "greater or equal") return ">=";
  if (operator === "equal") return "=";
  if (operator === "not equal") return "!=";
  if (operator === "less") return "<";
  if (operator === "less or equal") return "<=";
  return "=";
};

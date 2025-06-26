import type { Filter } from "@conquest/zod/schemas/filters.schema";

export const operatorParser = (operator: Filter["operator"]) => {
  if (operator === ">") return ">";
  if (operator === ">=") return ">=";
  if (operator === "equal") return "=";
  if (operator === "not_equal") return "!=";
  if (operator === "<") return "<";
  if (operator === "<=") return "<=";
  return "=";
};

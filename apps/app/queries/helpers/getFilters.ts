import {
  type Filter,
  FilterActivitySchema,
  FilterLevelSchema,
  FilterNumberSchema,
  FilterSelectSchema,
  FilterTextSchema,
} from "@conquest/zod/schemas/filters.schema";
import { Prisma } from "@prisma/client";

type Props = {
  filters: Filter[];
};

export const getFilters = ({ filters }: Props) => {
  return filters.map((filter) => {
    if (filter.type === "text") {
      const { value, operator, field } = FilterTextSchema.parse(filter);
      const fieldCondition = Prisma.raw(field);
      const likePattern = `%${value}%`;

      switch (operator) {
        case "contains":
          return Prisma.sql`m.${fieldCondition}::text ILIKE ${likePattern}`;
        case "not_contains":
          return Prisma.sql`m.${fieldCondition}::text NOT ILIKE ${likePattern}`;
        default:
          return Prisma.sql`TRUE`;
      }
    }

    if (filter.type === "select") {
      const { values, operator, field } = FilterSelectSchema.parse(filter);
      const fieldCondition = Prisma.raw(field);
      const likePattern = `%${values.join(",")}%`;

      switch (operator) {
        case "contains":
          return Prisma.sql`m.${fieldCondition}::text ILIKE ${likePattern}`;
        case "not_contains":
          return Prisma.sql`m.${fieldCondition}::text NOT ILIKE ${likePattern}`;
        default:
          return Prisma.sql`TRUE`;
      }
    }

    if (filter.type === "level") {
      const { value, operator, field } = FilterLevelSchema.parse(filter);
      const fieldCondition = Prisma.raw(field);

      switch (operator) {
        case "greater":
          return Prisma.sql`m.${fieldCondition} > ${value}`;
        case "greater or equal":
          return Prisma.sql`m.${fieldCondition} >= ${value}`;
        case "equal":
          return Prisma.sql`m.${fieldCondition} = ${value}`;
        case "not equal":
          return Prisma.sql`m.${fieldCondition} != ${value}`;
        case "less":
          return Prisma.sql`m.${fieldCondition} < ${value}`;
        case "less or equal":
          return Prisma.sql`m.${fieldCondition} <= ${value}`;
        default:
          return Prisma.sql`TRUE`;
      }
    }

    if (filter.type === "number") {
      const { value, operator, field } = FilterNumberSchema.parse(filter);
      const fieldCondition = Prisma.raw(field);

      switch (operator) {
        case "greater":
          return Prisma.sql`m.${fieldCondition} > ${value}`;
        case "greater or equal":
          return Prisma.sql`m.${fieldCondition} >= ${value}`;
        case "equal":
          return Prisma.sql`m.${fieldCondition} = ${value}`;
        case "not equal":
          return Prisma.sql`m.${fieldCondition} != ${value}`;
        case "less":
          return Prisma.sql`m.${fieldCondition} < ${value}`;
        case "less or equal":
          return Prisma.sql`m.${fieldCondition} <= ${value}`;
        default:
          return Prisma.sql`TRUE`;
      }
    }

    if (filter.type === "activity" && filter.activity_types.length) {
      const {
        activity_types,
        operator,
        value: count,
        dynamic_date,
      } = FilterActivitySchema.parse(filter);

      const intervalStr = `'${dynamic_date}'::interval`;

      const activityKeys = activity_types.map((at) => at.key);
      const operatorParsed = getOperator(operator);

      const condition = Prisma.sql`(
        SELECT COUNT(*)
        FROM activities a
        JOIN activities_types at ON a.activity_type_id = at.id
        WHERE a.member_id = m.id
        AND at.key = ANY(${Prisma.raw(
          `ARRAY[${activityKeys.map((key) => `'${key}'`).join(",")}]`,
        )})
        AND a.created_at >= NOW() - ${Prisma.raw(intervalStr)}
      ) ${Prisma.raw(operatorParsed)} ${count}`;

      return condition;
    }

    return Prisma.sql`TRUE`;
  });
};

const getOperator = (operator: Filter["operator"]) => {
  if (operator === "greater") return ">";
  if (operator === "greater or equal") return ">=";
  if (operator === "equal") return "=";
  if (operator === "not equal") return "!=";
  if (operator === "less") return "<";
  if (operator === "less or equal") return "<=";
  return "=";
};

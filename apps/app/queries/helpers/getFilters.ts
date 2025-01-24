import {
  type Filter,
  FilterActivitySchema,
  FilterLevelSchema,
  FilterNumberSchema,
  FilterSchema,
  FilterSelectSchema,
  FilterTextSchema,
} from "@conquest/zod/schemas/filters.schema";
import { Prisma } from "@prisma/client";

type Props = {
  filters: Filter[];
};

export const getFilters = ({ filters }: Props) => {
  return filters.map((filter) => {
    const parsedFilter = FilterSchema.parse(filter);
    const { field } = parsedFilter;

    if (field === "tags") {
      const { values, operator } = FilterSelectSchema.parse(filter);
      const fieldCondition = Prisma.raw(field);

      if (operator === "empty") {
        return Prisma.sql`array_length(m.${fieldCondition}, 1) IS NULL OR array_length(m.${fieldCondition}, 1) = 0`;
      }
      if (operator === "not_empty") {
        return Prisma.sql`array_length(m.${fieldCondition}, 1) > 0`;
      }

      const conditions = values.map((value) => {
        const likePattern = `%${value}%`;
        return operator === "contains"
          ? Prisma.sql`m.${fieldCondition}::text ILIKE ${likePattern}`
          : Prisma.sql`m.${fieldCondition}::text NOT ILIKE ${likePattern}`;
      });

      const joinOperator = operator === "contains" ? " OR " : " AND ";
      return Prisma.sql`(${Prisma.join(conditions, joinOperator)})`;
    }

    if (filter.type === "text") {
      const { value, operator, field } = FilterTextSchema.parse(filter);
      const fieldCondition = Prisma.raw(field);
      const likePattern = `%${value}%`;

      switch (operator) {
        case "contains":
          return Prisma.sql`m.${fieldCondition}::text ILIKE ${likePattern}`;
        case "not_contains":
          return Prisma.sql`m.${fieldCondition}::text NOT ILIKE ${likePattern}`;
        case "empty":
          return Prisma.sql`m.${fieldCondition}::text IS NULL`;
        case "not_empty":
          return Prisma.sql`m.${fieldCondition}::text IS NOT NULL`;
        default:
          return Prisma.sql`TRUE`;
      }
    }

    if (filter.type === "select") {
      const { values, operator, field } = FilterSelectSchema.parse(filter);
      const fieldCondition = Prisma.raw(field);

      const conditions =
        values.length === 0
          ? [Prisma.sql`TRUE`]
          : values.map((value) => {
              if (field === "language") {
                return operator === "contains"
                  ? Prisma.sql`split_part(m.locale::text, '_', 1) = ${value}`
                  : Prisma.sql`split_part(m.locale::text, '_', 1) != ${value}`;
              }

              if (field === "country") {
                return operator === "contains"
                  ? Prisma.sql`m.locale = ${value}`
                  : Prisma.sql`m.locale != ${value}`;
              }

              if (field === "linked_profiles") {
                const profileField = `${value.toLowerCase()}_id`;
                return operator === "contains"
                  ? Prisma.sql`m.${Prisma.raw(profileField)} IS NOT NULL`
                  : Prisma.sql`m.${Prisma.raw(profileField)} IS NULL`;
              }

              const likePattern = `%${value}%`;
              return operator === "contains"
                ? Prisma.sql`m.${fieldCondition}::text ILIKE ${likePattern}`
                : Prisma.sql`m.${fieldCondition}::text NOT ILIKE ${likePattern}`;
            });

      if (operator === "empty")
        return Prisma.sql`m.${fieldCondition}::text IS NULL`;
      if (operator === "not_empty")
        return Prisma.sql`m.${fieldCondition}::text IS NOT NULL`;

      const joinOperator = operator === "contains" ? " OR " : " AND ";
      return Prisma.sql`(${Prisma.join(conditions, joinOperator)})`;
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
        who,
        operator,
        value: count,
        dynamic_date,
        display_count,
      } = FilterActivitySchema.parse(filter);

      const intervalStr = `'${dynamic_date}'::interval`;
      const activityKeys = activity_types.map((at) => at.key);
      const operatorParsed = getOperator(operator);

      if (display_count) {
        return Prisma.sql`(
          SELECT COUNT(*)
          FROM activities a
          JOIN activities_types at ON a.activity_type_id = at.id
          WHERE a.member_id ${who === "who_did_not" ? Prisma.sql`!=` : Prisma.sql`=`} m.id
          AND at.key = ANY(${Prisma.raw(
            `ARRAY[${activityKeys.map((key) => `'${key}'`).join(",")}]`,
          )})
          AND a.created_at >= NOW() - ${Prisma.raw(intervalStr)}
        ) ${Prisma.raw(operatorParsed)} ${count}`;
      }

      return Prisma.sql`EXISTS (
        SELECT 1
        FROM activities a
        JOIN activities_types at ON a.activity_type_id = at.id
        WHERE a.member_id ${who === "who_did_not" ? Prisma.sql`!=` : Prisma.sql`=`} m.id
        AND at.key = ANY(${Prisma.raw(
          `ARRAY[${activityKeys.map((key) => `'${key}'`).join(",")}]`,
        )})
        AND a.created_at >= NOW() - ${Prisma.raw(intervalStr)}
      )`;
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

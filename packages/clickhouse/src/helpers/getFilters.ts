import type { GroupFilters } from "@conquest/zod/schemas/filters.schema";

type Props = {
  groupFilters: GroupFilters;
};

export const getFilters = ({ groupFilters }: Props) => {
  // return groupFilters.filters.map((filter) => {
  //   const parsedFilter = FilterSchema.parse(filter);
  //   const { field } = parsedFilter;
  //   if (field === "tags") {
  //     const { values, operator } = FilterSelectSchema.parse(filter);
  //     const fieldCondition = Prisma.raw(field);
  //     if (!values.length) return Prisma.sql`TRUE`;
  //     if (operator === "empty") {
  //       return Prisma.sql`array_length(m.${fieldCondition}, 1) IS NULL OR array_length(m.${fieldCondition}, 1) = 0`;
  //     }
  //     if (operator === "not_empty") {
  //       return Prisma.sql`array_length(m.${fieldCondition}, 1) > 0`;
  //     }
  //     const conditions = values.map((value) => {
  //       const likePattern = `%${value}%`;
  //       return operator === "contains"
  //         ? Prisma.sql`m.${fieldCondition}::text ILIKE ${likePattern}`
  //         : Prisma.sql`m.${fieldCondition}::text NOT ILIKE ${likePattern}`;
  //     });
  //     const joinOperator = operator === "contains" ? " OR " : " AND ";
  //     return Prisma.sql`(${Prisma.join(conditions, joinOperator)})`;
  //   }
  //   if (field === "phones") {
  //     const { value, operator } = FilterTextSchema.parse(filter);
  //     const fieldCondition = Prisma.raw(field);
  //     if (!value && operator !== "empty" && operator !== "not_empty") {
  //       return Prisma.sql`TRUE`;
  //     }
  //     switch (operator) {
  //       case "contains":
  //         return Prisma.sql`EXISTS (SELECT 1 FROM unnest(m.${fieldCondition}) phone WHERE phone ILIKE ${`%${value}%`})`;
  //       case "not_contains":
  //         return Prisma.sql`NOT EXISTS (SELECT 1 FROM unnest(m.${fieldCondition}) phone WHERE phone ILIKE ${`%${value}%`})`;
  //       case "empty":
  //         return Prisma.sql`array_length(m.${fieldCondition}, 1) IS NULL OR array_length(m.${fieldCondition}, 1) = 0`;
  //       case "not_empty":
  //         return Prisma.sql`array_length(m.${fieldCondition}, 1) > 0`;
  //       default:
  //         return Prisma.sql`TRUE`;
  //     }
  //   }
  //   if (filter.type === "text") {
  //     const { value, operator, field } = FilterTextSchema.parse(filter);
  //     const fieldCondition = Prisma.raw(field);
  //     const likePattern = `%${value}%`;
  //     if (!value && operator !== "empty" && operator !== "not_empty") {
  //       return Prisma.sql`TRUE`;
  //     }
  //     switch (operator) {
  //       case "contains":
  //         return Prisma.sql`m.${fieldCondition}::text ILIKE ${likePattern}`;
  //       case "not_contains":
  //         return Prisma.sql`m.${fieldCondition}::text NOT ILIKE ${likePattern}`;
  //       case "empty":
  //         return Prisma.sql`m.${fieldCondition}::text IS NULL`;
  //       case "not_empty":
  //         return Prisma.sql`m.${fieldCondition}::text IS NOT NULL`;
  //       default:
  //         return Prisma.sql`TRUE`;
  //     }
  //   }
  //   if (filter.type === "select") {
  //     const { values, operator, field } = FilterSelectSchema.parse(filter);
  //     const fieldCondition = Prisma.raw(field);
  //     if (field === "linked_profiles") {
  //       if (operator === "empty") {
  //         return Prisma.sql`NOT EXISTS (SELECT 1 FROM jsonb_array_elements_text(ps.sources))`;
  //       }
  //       if (operator === "not_empty") {
  //         return Prisma.sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(ps.sources))`;
  //       }
  //       const conditions =
  //         values.length === 0
  //           ? [Prisma.sql`TRUE`]
  //           : values.map((value) =>
  //               operator === "contains"
  //                 ? Prisma.sql`${value} = ANY (SELECT jsonb_array_elements_text(ps.sources))`
  //                 : Prisma.sql`NOT (${value} = ANY (SELECT jsonb_array_elements_text(ps.sources)))`,
  //             );
  //       const joinOperator = operator === "contains" ? " OR " : " AND ";
  //       return Prisma.sql`(${Prisma.join(conditions, joinOperator)})`;
  //     }
  //     const conditions =
  //       values.length === 0
  //         ? [Prisma.sql`TRUE`]
  //         : values.map((value) => {
  //             const likePattern = `%${value}%`;
  //             return operator === "contains"
  //               ? Prisma.sql`m.${fieldCondition}::text ILIKE ${likePattern}`
  //               : Prisma.sql`m.${fieldCondition}::text NOT ILIKE ${likePattern}`;
  //           });
  //     if (operator === "empty")
  //       return Prisma.sql`m.${fieldCondition}::text IS NULL`;
  //     if (operator === "not_empty")
  //       return Prisma.sql`m.${fieldCondition}::text IS NOT NULL`;
  //     const joinOperator = operator === "contains" ? " OR " : " AND ";
  //     return Prisma.sql`(${Prisma.join(conditions, joinOperator)})`;
  //   }
  //   if (filter.type === "level") {
  //     const { value, operator } = FilterLevelSchema.parse(filter);
  //     if (!value) return Prisma.sql`TRUE`;
  //     switch (operator) {
  //       case ">":
  //         return Prisma.sql`l.number > ${value}`;
  //       case ">=":
  //         return Prisma.sql`l.number >= ${value}`;
  //       case "equal":
  //         return Prisma.sql`l.number = ${value}`;
  //       case "not equal":
  //         return Prisma.sql`l.number != ${value}`;
  //       case "<":
  //         return Prisma.sql`l.number < ${value}`;
  //       case "<=":
  //         return Prisma.sql`l.number <= ${value}`;
  //       default:
  //         return Prisma.sql`TRUE`;
  //     }
  //   }
  //   if (filter.type === "number") {
  //     const { value, operator, field } = FilterNumberSchema.parse(filter);
  //     const fieldCondition = Prisma.raw(field);
  //     switch (operator) {
  //       case ">":
  //         return Prisma.sql`m.${fieldCondition} > ${value}`;
  //       case ">=":
  //         return Prisma.sql`m.${fieldCondition} >= ${value}`;
  //       case "equal":
  //         return Prisma.sql`m.${fieldCondition} = ${value}`;
  //       case "not equal":
  //         return Prisma.sql`m.${fieldCondition} != ${value}`;
  //       case "<":
  //         return Prisma.sql`m.${fieldCondition} < ${value}`;
  //       case "<=":
  //         return Prisma.sql`m.${fieldCondition} <= ${value}`;
  //       default:
  //         return Prisma.sql`TRUE`;
  //     }
  //   }
  //   if (filter.type === "activity" && filter.activity_types.length) {
  //     const {
  //       activity_types,
  //       who,
  //       operator,
  //       value: count,
  //       channels,
  //       dynamic_date,
  //       display_count,
  //       display_date,
  //       display_channel,
  //     } = FilterActivitySchema.parse(filter);
  //     const intervalStr = `'${dynamic_date}'::interval`;
  //     const activityKeys = activity_types.map((at) => at.key);
  //     const operatorParsed = operatorParser(operator);
  //     if (display_count) {
  //       if (who === "who_did_not") {
  //         return Prisma.sql`(
  //           SELECT COUNT(*)
  //           FROM member m2
  //           WHERE m2.id = m.id
  //           AND NOT EXISTS (
  //             SELECT 1
  //             FROM activity a
  //             JOIN activity_type at ON a.activity_type_id = at.id
  //             WHERE a.member_id = m2.id
  //             AND at.key = ANY(${Prisma.raw(
  //               `ARRAY[${activityKeys.map((key) => `'${key}'`).join(",")}]`,
  //             )})
  //             ${display_date ? Prisma.sql`AND a.created_at >= NOW() - ${Prisma.raw(intervalStr)}` : Prisma.sql``}
  //             ${
  //               display_channel
  //                 ? Prisma.sql`AND a.channel_id = ANY(${Prisma.raw(
  //                     `ARRAY[${channels.map((channel) => `'${channel.id}'`).join(",")}]`,
  //                   )})`
  //                 : Prisma.sql``
  //             }
  //           )
  //         ) ${Prisma.raw(operatorParsed)} ${count}`;
  //       }
  //       return Prisma.sql`(
  //         SELECT COUNT(*)
  //         FROM activity a
  //         JOIN activity_type at ON a.activity_type_id = at.id
  //         WHERE a.member_id = m.id
  //         AND at.key = ANY(${Prisma.raw(
  //           `ARRAY[${activityKeys.map((key) => `'${key}'`).join(",")}]`,
  //         )})
  //         ${display_date ? Prisma.sql`AND a.created_at >= NOW() - ${Prisma.raw(intervalStr)}` : Prisma.sql``}
  //         ${
  //           display_channel
  //             ? Prisma.sql`AND a.channel_id = ANY(${Prisma.raw(
  //                 `ARRAY[${channels.map((channel) => `'${channel.id}'`).join(",")}]`,
  //               )})`
  //             : Prisma.sql``
  //         }
  //       ) ${Prisma.raw(operatorParsed)} ${count}`;
  //     }
  //     if (who === "who_did_not") {
  //       return Prisma.sql`NOT EXISTS (
  //         SELECT 1
  //         FROM activity a
  //         JOIN activity_type at ON a.activity_type_id = at.id
  //         WHERE a.member_id = m.id
  //         AND at.key = ANY(${Prisma.raw(
  //           `ARRAY[${activityKeys.map((key) => `'${key}'`).join(",")}]`,
  //         )})
  //         ${display_date ? Prisma.sql`AND a.created_at >= NOW() - ${Prisma.raw(intervalStr)}` : Prisma.sql``}
  //         ${
  //           display_channel
  //             ? Prisma.sql`AND a.channel_id = ANY(${Prisma.raw(
  //                 `ARRAY[${channels.map((channel) => `'${channel.id}'`).join(",")}]`,
  //               )})`
  //             : Prisma.sql``
  //         }
  //       )`;
  //     }
  //     return Prisma.sql`EXISTS (
  //       SELECT 1
  //       FROM activity a
  //       JOIN activity_type at ON a.activity_type_id = at.id
  //       WHERE a.member_id = m.id
  //       AND at.key = ANY(${Prisma.raw(
  //         `ARRAY[${activityKeys.map((key) => `'${key}'`).join(",")}]`,
  //       )})
  //       ${display_date ? Prisma.sql`AND a.created_at >= NOW() - ${Prisma.raw(intervalStr)}` : Prisma.sql``}
  //       ${
  //         display_channel
  //           ? Prisma.sql`AND a.channel_id = ANY(${Prisma.raw(
  //               `ARRAY[${channels.map((channel) => `'${channel.id}'`).join(",")}]`,
  //             )})`
  //           : Prisma.sql``
  //       }
  //     )`;
  //   }
  //   return Prisma.sql`TRUE`;
  // });
};

import {
  FilterActivitySchema,
  FilterLevelSchema,
  FilterNumberSchema,
  FilterSchema,
  FilterSelectSchema,
  FilterTextSchema,
  type GroupFilters,
} from "@conquest/zod/schemas/filters.schema";
import { operatorParser } from "./operatorParser";

type Props = {
  groupFilters: GroupFilters;
};

export const getFilters = ({ groupFilters }: Props) => {
  return groupFilters.filters.map((filter) => {
    const parsedFilter = FilterSchema.parse(filter);
    const { field } = parsedFilter;

    if (field === "linked_profiles") {
      const { values, operator } = FilterSelectSchema.parse(filter);

      if (values.length === 0 && !["empty", "not_empty"].includes(operator)) {
        return "true";
      }

      switch (operator) {
        case "contains":
          return values
            .map((value) => `hasAny(profile_sources, ['${value}'])`)
            .join(" OR ");
        case "not_contains":
          return values
            .map((value) => `NOT hasAny(profile_sources, ['${value}'])`)
            .join(" AND ");
        case "empty":
          return "empty(profile_sources)";
        case "not_empty":
          return "notEmpty(profile_sources)";
      }
    }

    if (field === "tags") {
      const { values, operator } = FilterSelectSchema.parse(filter);

      if (values.length === 0 && !["empty", "not_empty"].includes(operator)) {
        return "true";
      }

      switch (operator) {
        case "contains":
          return values
            .map((value) => `hasAny(tags, ['${value}'])`)
            .join(" OR ");
        case "not_contains":
          return values
            .map((value) => `NOT hasAny(tags, ['${value}'])`)
            .join(" AND ");
        case "empty":
          return "empty(tags)";
        case "not_empty":
          return "notEmpty(tags)";
      }
    }

    if (field === "phones") {
      const { value, operator } = FilterTextSchema.parse(filter);

      if (!value && !["empty", "not_empty"].includes(operator)) {
        return "true";
      }

      switch (operator) {
        case "contains":
          return `arrayExists(x -> position(lower(x), lower('${value}')) > 0, phones)`;
        case "not_contains":
          return `NOT arrayExists(x -> position(lower(x), lower('${value}')) > 0, phones)`;
        case "empty":
          return "empty(phones)";
        case "not_empty":
          return "notEmpty(phones)";
        default:
          return "true";
      }
    }

    if (filter.type === "text") {
      const { value, operator, field } = FilterTextSchema.parse(filter);

      if (!value && !["empty", "not_empty"].includes(operator)) {
        return "true";
      }

      switch (operator) {
        case "contains":
          return `m.${field} ILIKE '%${value}%'`;
        case "not_contains":
          return `m.${field} NOT ILIKE '%${value}%'`;
        case "empty":
          return `m.${field} = ''`;
        case "not_empty":
          return `m.${field} != ''`;
      }
    }

    if (filter.type === "select") {
      const { values, operator, field } = FilterSelectSchema.parse(filter);

      if (values.length === 0 && !["empty", "not_empty"].includes(operator)) {
        return "true";
      }

      switch (operator) {
        case "contains":
          return `m.${field} IN (${values.map((value) => `'${value}'`).join(",")})`;
        case "not_contains":
          return `m.${field} NOT IN (${values.map((value) => `'${value}'`).join(",")})`;
        case "empty":
          return `m.${field} = ''`;
        case "not_empty":
          return `m.${field} != ''`;
      }
    }

    if (filter.type === "level") {
      const { value, operator } = FilterLevelSchema.parse(filter);

      if (!value) return "true";

      switch (operator) {
        case ">":
          return `l.number > ${value}`;
        case ">=":
          return `l.number >= ${value}`;
        case "equal":
          return `l.number = ${value}`;
        case "not equal":
          return `l.number != ${value}`;
        case "<":
          return `l.number < ${value}`;
        case "<=":
          return `l.number <= ${value}`;
      }
    }

    if (filter.type === "number") {
      const { value, operator, field } = FilterNumberSchema.parse(filter);

      if (!value) return "true";

      switch (operator) {
        case ">":
          return `m.${field} > ${value}`;
        case ">=":
          return `m.${field} >= ${value}`;
        case "equal":
          return `m.${field} = ${value}`;
        case "not equal":
          return `m.${field} != ${value}`;
        case "<":
          return `m.${field} < ${value}`;
        case "<=":
          return `m.${field} <= ${value}`;
      }
    }

    if (filter.type === "activity") {
      const {
        activity_types,
        who,
        operator,
        value: count,
        channels,
        dynamic_date,
        display_count,
        display_date,
        display_channel,
      } = FilterActivitySchema.parse(filter);

      if (activity_types.length === 0) {
        return "true";
      }

      const activityKeys = activity_types.map((at) => `'${at.key}'`).join(",");
      const channelIds = channels.map((channel) => `'${channel.id}'`).join(",");
      const operatorParsed = operatorParser(operator);

      const dateCondition = display_date
        ? `AND a.created_at >= now() - INTERVAL '${dynamic_date}'`
        : "";
      const channelCondition = display_channel
        ? `AND a.channel_id IN (${channelIds})`
        : "";

      const subquery = `
        SELECT member_id
        FROM (
          SELECT 
            a.member_id,
            count(*) as activity_count
          FROM activity a
          JOIN activity_type at ON a.activity_type_id = at.id
          WHERE at.key IN (${activityKeys})
          ${dateCondition}
          ${channelCondition}
          GROUP BY a.member_id
          HAVING ${display_count ? `activity_count ${operatorParsed} ${count}` : "true"}
        )`;

      return who === "who_did"
        ? `m.id IN (${subquery})`
        : `m.id NOT IN (${subquery})`;
    }
  });
};

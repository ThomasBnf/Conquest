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

    if (field.includes("discourse-")) {
      const customFieldId = field.split("-")[1];

      if (filter.type === "text") {
        const { value, operator } = FilterTextSchema.parse(filter);

        if (!value && !["empty", "notEmpty"].includes(operator)) {
          return "true";
        }

        const formattedValue = value?.toLowerCase();

        const innerCondition = `
            arrayExists(x -> (
              JSONExtractString(x, 'id') = '${customFieldId}' AND 
              position(lower(JSONExtractString(x, 'value')), '${formattedValue}') > 0
            ), JSONExtractArrayRaw(toJSONString(attr), 'customFields'))
          `;

        switch (operator) {
          case "contains":
            return `
                arrayExists(attr -> attr.source = 'Discourse' AND ${innerCondition}, p.attributes)
              `.trim();
          case "not_contains":
            return `
                NOT arrayExists(attr -> attr.source = 'Discourse' AND ${innerCondition}, p.attributes)
              `.trim();
          case "empty":
            return `
                arrayExists(attr -> attr.source = 'Discourse' AND arrayExists(
                  x -> JSONExtractString(x, 'id') = '${customFieldId}' AND (JSONExtractString(x, 'value') = '' OR JSONExtractString(x, 'value') IS NULL),
                  JSONExtractArrayRaw(toJSONString(attr), 'customFields')
                ), p.attributes)
              `.trim();
          case "not_empty":
            return `
                arrayExists(attr -> attr.source = 'Discourse' AND arrayExists(
                  x -> JSONExtractString(x, 'id') = '${customFieldId}' AND (JSONExtractString(x, 'value') != '' AND JSONExtractString(x, 'value') IS NOT NULL),
                  JSONExtractArrayRaw(toJSONString(attr), 'customFields')
                ), p.attributes)
              `.trim();
          default:
            return "true";
        }
      }

      return "true";
    }

    if (field.includes("github-")) {
      const customFieldId = field.split("-")[1];

      if (filter.type === "number") {
        const { value, operator } = FilterNumberSchema.parse(filter);

        if (
          (value === undefined || value === null) &&
          !["empty", "notEmpty"].includes(operator)
        ) {
          return "true";
        }

        const parsedOperator = operatorParser(operator);
        const hasGithub = `arrayExists(attr -> attr.source = 'Github'`;
        const condition = `toFloat64OrNull(JSONExtractString(toJSONString(attr), '${customFieldId}')) ${parsedOperator} ${value}, p.attributes)`;

        switch (operator) {
          case ">":
            return `${hasGithub} AND ${condition}`;
          case ">=":
            return `${hasGithub} AND ${condition}`;
          case "equal":
            return `${hasGithub} AND ${condition}`;
          case "not_equal":
            return `${hasGithub} AND ${condition}`;
          case "<":
            return `${hasGithub} AND ${condition}`;
          case "<=":
            return `${hasGithub} AND ${condition}`;
          default:
            return "true";
        }
      }

      if (filter.type === "text") {
        const { value, operator } = FilterTextSchema.parse(filter);

        if (
          (value === undefined || value === null) &&
          !["empty", "notEmpty"].includes(operator)
        ) {
          return "true";
        }

        const hasGithub = `arrayExists(attr -> attr.source = 'Github'`;
        const condition = `position(lower(toString(attr.${customFieldId})), lower('${value}')) > 0, p.attributes)`;

        switch (operator) {
          case "contains":
            return `${hasGithub} AND ${condition}`;
          case "not_contains":
            return `${hasGithub} AND NOT ${condition}`;
          case "empty":
            return `${hasGithub} AND (attr.${customFieldId} = '' OR attr.${customFieldId} IS NULL), p.attributes)`;
          case "not_empty":
            return `${hasGithub} AND attr.${customFieldId} != '' AND attr.${customFieldId} IS NOT NULL, p.attributes)`;
          default:
            return "true";
        }
      }

      return "true";
    }

    if (field === "profiles") {
      const { values, operator } = FilterSelectSchema.parse(filter);

      if (values.length === 0 && !["empty", "notEmpty"].includes(operator)) {
        return "true";
      }

      switch (operator) {
        case "contains":
          return values
            .map(
              (value) =>
                `arrayExists(attr -> attr.source = '${value}', p.attributes)`,
            )
            .join(" OR ");
        case "not_contains":
          return values
            .map(
              (value) =>
                `NOT arrayExists(attr -> attr.source = '${value}', p.attributes)`,
            )
            .join(" AND ");
        case "empty":
          return `empty(p.attributes) OR NOT arrayExists(attr -> attr.source != '', p.attributes)`;
        case "not_empty":
          return `notEmpty(p.attributes) AND arrayExists(attr -> attr.source != '', p.attributes)`;
        default:
          return "true";
      }
    }

    if (field === "tags") {
      const { values, operator } = FilterSelectSchema.parse(filter);

      if (values.length === 0 && !["empty", "notEmpty"].includes(operator)) {
        return "true";
      }

      switch (operator) {
        case "contains": {
          const formattedValues = values
            .map((value) => `'${value}'`)
            .join(", ");
          return `hasAny(tags, [${formattedValues}])`;
        }
        case "not_contains": {
          const formattedValues = values
            .map((value) => `'${value}'`)
            .join(", ");
          return `NOT hasAny(tags, [${formattedValues}])`;
        }
        case "empty":
          return "empty(tags)";
        case "not_empty":
          return "notEmpty(tags)";
        default:
          return "true";
      }
    }

    if (field === "phones") {
      const { value, operator } = FilterTextSchema.parse(filter);

      if (!value && !["empty", "notEmpty"].includes(operator)) {
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

      if (!value && !["empty", "notEmpty"].includes(operator)) {
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
        default:
          return "true";
      }
    }

    if (filter.type === "select") {
      const { values, operator, field } = FilterSelectSchema.parse(filter);

      if (values.length === 0 && !["empty", "notEmpty"].includes(operator)) {
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
        default:
          return "true";
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
        case "not_equal":
          return `l.number != ${value}`;
        case "<":
          return `l.number < ${value}`;
        case "<=":
          return `l.number <= ${value}`;
        default:
          return "true";
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
        case "not_equal":
          return `m.${field} != ${value}`;
        case "<":
          return `m.${field} < ${value}`;
        case "<=":
          return `m.${field} <= ${value}`;
        default:
          return "true";
      }
    }

    if (filter.type === "activity") {
      const {
        activityTypes,
        who,
        operator,
        value: count,
        channels,
        dynamicDate,
        displayCount,
        displayDate,
        displayChannel,
      } = FilterActivitySchema.parse(filter);

      if (activityTypes.length === 0) {
        return "true";
      }

      const anyActivity = activityTypes.some((at) => at.key === "anyActivity");

      const activityKeys = activityTypes.map((at) => `'${at.key}'`).join(",");
      const channelIds = channels.map((channel) => `'${channel.id}'`).join(",");
      const operatorParsed = operatorParser(operator);

      const dateCondition = displayDate
        ? `AND a.createdAt >= now() - INTERVAL '${dynamicDate}'`
        : "";
      const channelCondition = displayChannel
        ? `AND a.channelId IN (${channelIds})`
        : "";

      const subquery = `
        SELECT memberId
        FROM (
          SELECT 
            a.memberId,
            count(*) as activityCount
          FROM activity a
          JOIN activityType at ON a.activityTypeId = at.id
          WHERE ${anyActivity ? "true" : `at.key IN (${activityKeys})`}
          ${dateCondition}
          ${channelCondition}
          GROUP BY a.memberId
          HAVING ${
            anyActivity
              ? "activityCount > 0"
              : displayCount
                ? `activityCount ${operatorParsed} ${count}`
                : "true"
          }
        )`;

      return who === "who_did"
        ? `m.id IN (${subquery})`
        : `m.id NOT IN (${subquery})`;
    }

    return "true";
  });
};

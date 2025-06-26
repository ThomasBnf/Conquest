import {
  FilterActivitySchema,
  FilterLevelSchema,
  FilterNumberSchema,
  FilterSchema,
  FilterSelectSchema,
  FilterTextSchema,
  type GroupFilters,
} from "@conquest/zod/schemas/filters.schema";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { Prisma, prisma } from "../prisma";

type Props = {
  groupFilters: GroupFilters;
};

export const getFilters = async ({
  groupFilters,
}: Props): Promise<Prisma.MemberWhereInput[]> => {
  return await Promise.all(
    groupFilters.filters.map(async (filter) => {
      const { type, field } = FilterSchema.parse(filter);

      if (type === "text") {
        const { value, operator } = FilterTextSchema.parse(filter);

        if (field === "phones") {
          if (!value) return {};

          switch (operator) {
            case "contains":
              return { phones: { hasSome: [value] } };
            case "not_contains":
              return { NOT: { phones: { hasSome: [value] } } };
            case "empty":
              return { phones: { equals: [] } };
            case "not_empty":
              return { NOT: { phones: { equals: [] } } };
            default:
              return {};
          }
        }

        switch (operator) {
          case "contains":
            return { [field]: { contains: value } };
          case "not_contains":
            return { [field]: { not: { contains: value } } };
          case "empty":
            return { [field]: { equals: "" } };
          case "not_empty":
            return { [field]: { not: { equals: "" } } };
          default:
            return {};
        }
      }

      if (type === "number") {
        const { value, operator } = FilterNumberSchema.parse(filter);

        switch (operator) {
          case ">":
            return { [field]: { gt: value } };
          case ">=":
            return { [field]: { gte: value } };
          case "equal":
            return { [field]: { equals: value } };
          case "not_equal":
            return { [field]: { not: value } };
          case "<":
            return { [field]: { lt: value } };
          case "<=":
            return { [field]: { lte: value } };
          default:
            return {};
        }
      }

      if (field === "tags") {
        const { values, operator } = FilterSelectSchema.parse(filter);

        if (!values.length) return {};

        switch (operator) {
          case "contains":
            return { tags: { hasSome: values } };
          case "not_contains":
            return { NOT: { tags: { hasSome: values } } };
          case "empty":
            return { tags: { equals: [] } };
          case "not_empty":
            return { NOT: { tags: { equals: [] } } };
          default:
            return {};
        }
      }

      if (field === "profiles") {
        const { values, operator } = FilterSelectSchema.parse(filter);

        if (!values.length) return {};

        const attributes = values.map((value) => ({
          attributes: { path: ["source"], equals: value },
        }));

        switch (operator) {
          case "contains":
            return { profiles: { some: { OR: attributes } } };
          case "not_contains":
            return { profiles: { some: { NOT: { OR: attributes } } } };
          case "empty":
            return {
              profiles: {
                none: {},
              },
            };
          case "not_empty":
            return {
              profiles: {
                some: { attributes: { path: ["source"], not: { equals: "" } } },
              },
            };
          default:
            return {};
        }
      }

      if (type === "select") {
        const { values, operator } = FilterSelectSchema.parse(filter);

        if (!values.length) return {};

        switch (operator) {
          case "contains":
            return { [field]: { in: values } };
          case "not_contains":
            return { [field]: { not: { in: values } } };
          case "empty":
            return { [field]: { equals: "" } };
          case "not_empty":
            return { [field]: { not: { equals: "" } } };
          default:
            return {};
        }
      }

      if (type === "level") {
        const { value, operator } = FilterLevelSchema.parse(filter);

        switch (operator) {
          case ">":
            return { levelNumber: { gt: value } };
          case ">=":
            return { levelNumber: { gte: value } };
          case "equal":
            return { levelNumber: { equals: value } };
          case "not_equal":
            return { levelNumber: { not: value } };
          case "<":
            return { levelNumber: { lt: value } };
          case "<=":
            return { levelNumber: { lte: value } };
          default:
            return {};
        }
      }

      if (type === "activity") {
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

        if (!activityTypes.length) return {};

        const dateCondition = () => {
          switch (dynamicDate) {
            case "today":
              return {
                gte: startOfDay(new Date()),
                lte: endOfDay(new Date()),
              };
            case "yesterday":
              return {
                gte: startOfDay(subDays(new Date(), 1)),
                lte: endOfDay(subDays(new Date(), 1)),
              };
            case "7 days":
              return {
                gte: subDays(new Date(), 7),
                lte: endOfDay(new Date()),
              };
            case "30 days":
              return {
                gte: subDays(new Date(), 30),
                lte: endOfDay(new Date()),
              };
            case "90 days":
              return {
                gte: subDays(new Date(), 90),
                lte: endOfDay(new Date()),
              };
            case "365 days":
              return {
                gte: subDays(new Date(), 365),
                lte: endOfDay(new Date()),
              };
            default:
              return null;
          }
        };

        const getOperatorCondition = (operator: string, count: number) => {
          switch (operator) {
            case "=":
              return `= ${count}`;
            case ">":
              return `> ${count}`;
            case ">=":
              return `>= ${count}`;
            case "<":
              return `< ${count}`;
            case "<=":
              return `<= ${count}`;
          }
        };

        const buildActivityQuery = () => {
          const whereConditions: string[] = [];
          const queryParams: unknown[] = [];

          let paramIndex = 1;

          if (
            activityTypes.length > 0 &&
            activityTypes[0]?.key !== "any_activity"
          ) {
            const activityTypeKeys = activityTypes.map((at) => at.key);
            const placeholders = activityTypeKeys
              .map(() => `$${paramIndex++}`)
              .join(", ");

            whereConditions.push(`a."activityTypeKey" IN (${placeholders})`);
            queryParams.push(...activityTypeKeys);
          }

          if (displayChannel && channels.length > 0) {
            const channelIds = channels.map((ch) => ch.id);
            const placeholders = channelIds
              .map(() => `$${paramIndex++}`)
              .join(", ");

            whereConditions.push(`a."channelId" IN (${placeholders})`);
            queryParams.push(...channelIds);
          }

          const dateConditionResult = dateCondition();

          if (displayDate && dateConditionResult) {
            whereConditions.push(
              `a."createdAt" >= $${paramIndex++}::timestamp`,
            );
            whereConditions.push(
              `a."createdAt" <= $${paramIndex++}::timestamp`,
            );
            queryParams.push(
              dateConditionResult.gte.toISOString(),
              dateConditionResult.lte.toISOString(),
            );
          }

          const whereClause =
            whereConditions.length > 0
              ? `WHERE ${whereConditions.join(" AND ")}`
              : "";

          const havingClause = displayCount
            ? `HAVING COUNT(a.id) ${getOperatorCondition(operator, count)}`
            : "";

          return {
            query: `
              SELECT DISTINCT m.id 
              FROM "Member" m
              INNER JOIN "Activity" a ON a."memberId" = m.id
              ${whereClause}
              GROUP BY m.id
              ${havingClause}
            `,
            params: queryParams,
          };
        };

        try {
          const { query, params } = buildActivityQuery();

          const memberIds = await prisma
            .$queryRawUnsafe<{ id: string }[]>(query, ...params)
            .then((results) => results.map((r) => r.id));

          if (who === "who_did_not") {
            return {
              id: {
                notIn: memberIds,
              },
            };
          }

          return {
            id: {
              in: memberIds,
            },
          };
        } catch (error) {
          console.error("Error in activity filter query:", error);
          return {};
        }
      }

      return {};
    }),
  );
};

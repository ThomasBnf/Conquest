import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/queries/users/getAuthUser";
import {
  FilterActivitySchema,
  FilterNumberSchema,
  FilterSchema,
  FilterSelectSchema,
  FilterTextSchema,
} from "@conquest/zod/schemas/filters.schema";
import {
  MemberSchema,
  MemberWithCompanySchema,
} from "@conquest/zod/schemas/member.schema";
import { zValidator } from "@hono/zod-validator";
import { Prisma } from "@prisma/client";
import { startOfMonth, subMonths } from "date-fns";
import { Hono } from "hono";
import { z } from "zod";

export const members = new Hono()
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        search: z.string(),
        id: z.string(),
        desc: z.string().transform((val) => val === "true"),
        page: z.coerce.number(),
        pageSize: z.coerce.number(),
        filters: z
          .string()
          .transform((str) => JSON.parse(str))
          .pipe(z.array(FilterSchema)),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { search, id, desc, page, pageSize, filters } =
        c.req.valid("query");

      const searchParsed = search.toLowerCase().trim();

      const filterConditions = filters.map((filter) => {
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

        if (filter.type === "number") {
          const { value, operator, field } = FilterNumberSchema.parse(filter);
          const fieldCondition = Prisma.raw(field);

          switch (operator) {
            case ">":
              return Prisma.sql`m.${fieldCondition} > ${value}`;
            case ">=":
              return Prisma.sql`m.${fieldCondition} >= ${value}`;
            case "=":
              return Prisma.sql`m.${fieldCondition} = ${value}`;
            case "!=":
              return Prisma.sql`m.${fieldCondition} != ${value}`;
            case "<":
              return Prisma.sql`m.${fieldCondition} < ${value}`;
            case "<=":
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

          const condition = Prisma.sql`(
            SELECT COUNT(*)
            FROM activities a
            JOIN activities_types at ON a.activity_type_id = at.id
            WHERE a.member_id = m.id
            AND at.key = ANY(${Prisma.raw(
              `ARRAY[${activityKeys.map((key) => `'${key}'`).join(",")}]`,
            )})
            AND a.created_at >= NOW() - ${Prisma.raw(intervalStr)}
          ) ${Prisma.raw(operator)} ${count}`;

          return condition;
        }
        return;
      });

      const members = await prisma.$queryRaw`
        SELECT 
          m.*,
          c.id as company_id,
          c.name as company_name
        FROM members m
        LEFT JOIN companies c ON m.company_id = c.id
        WHERE 
          (
            LOWER(COALESCE(m.first_name, '')) LIKE '%' || ${searchParsed} || '%'
            OR LOWER(COALESCE(m.last_name, '')) LIKE '%' || ${searchParsed} || '%'
            OR EXISTS (
              SELECT 1 FROM unnest(m.emails) email 
              WHERE LOWER(email) LIKE '%' || ${searchParsed} || '%'
            )
            OR EXISTS (
              SELECT 1 FROM unnest(m.phones) phone
              WHERE LOWER(phone) LIKE '%' || ${searchParsed} || '%'
            )
          )
          AND m.workspace_id = ${workspace_id}
          ${
            filterConditions.length > 0
              ? Prisma.sql`AND (${Prisma.join(filterConditions, " AND ")})`
              : Prisma.sql``
          }
        GROUP BY m.id, c.id
        ORDER BY 
                CASE WHEN ${desc} = true THEN
                    CASE ${id}
                        WHEN 'love' THEN m.love
                        WHEN 'level' THEN m.level
                        ELSE NULL
                    END
                END DESC NULLS LAST,
                CASE WHEN ${desc} = true THEN
                    CASE ${id}
                        WHEN 'full_name' THEN m.first_name || ' ' || m.last_name
                        WHEN 'job_title' THEN m.job_title
                        WHEN 'emails' THEN m.emails[0]
                        WHEN 'tags' THEN m.tags[0]
                        WHEN 'joined_at' THEN m.joined_at::text
                        WHEN 'locale' THEN m.locale
                        WHEN 'source' THEN m.source::text
                        WHEN 'first_activity' THEN m.first_activity::text
                        WHEN 'last_activity' THEN m.last_activity::text
                        ELSE NULL
                    END
                END DESC NULLS LAST,
                CASE WHEN ${desc} = false THEN
                    CASE ${id}
                        WHEN 'love' THEN m.love
                        WHEN 'level' THEN m.level
                        ELSE NULL
                    END
                END ASC NULLS LAST,
                CASE WHEN ${desc} = false THEN
                    CASE ${id}
                        WHEN 'full_name' THEN m.first_name || ' ' || m.last_name
                        WHEN 'job_title' THEN m.job_title
                        WHEN 'emails' THEN m.emails[0]
                        WHEN 'tags' THEN m.tags[0]
                        WHEN 'joined_at' THEN m.joined_at::text
                        WHEN 'locale' THEN m.locale
                        WHEN 'source' THEN m.source::text
                        WHEN 'first_activity' THEN m.first_activity::text
                        WHEN 'last_activity' THEN m.last_activity::text
                        ELSE NULL
                    END
                END ASC NULLS LAST
        LIMIT ${pageSize}
        OFFSET ${(page - 1) * pageSize}
      `;

      return c.json(MemberWithCompanySchema.array().parse(members));
    },
  )
  .get("/all-members", async (c) => {
    const { workspace_id } = c.get("user");

    const members = await prisma.members.findMany({
      where: { workspace_id },
    });

    return c.json(MemberSchema.array().parse(members));
  })
  .get("/locales", async (c) => {
    const { workspace_id } = c.get("user");

    const memberLocales = await prisma.members.groupBy({
      by: ["locale"],
      where: { workspace_id },
    });

    const locales = memberLocales.map((locale) => locale.locale);

    return c.json(locales);
  })
  .get("/:memberId/metrics", async (c) => {
    const { workspace_id } = c.get("user");
    const { memberId } = c.req.param();

    const last3months = startOfMonth(subMonths(new Date(), 3));

    const member = await prisma.members.findUnique({
      where: {
        id: memberId,
        activities: {
          some: {
            created_at: {
              gte: last3months,
            },
          },
        },
        workspace_id,
      },
      include: {
        activities: {
          where: {
            created_at: {
              gte: last3months,
            },
          },
          include: {
            activity_type: true,
          },
        },
      },
    });

    const activities = member?.activities ?? [];

    const activityCounts = activities.reduce<
      Record<string, { count: number; weight: number }>
    >((acc, activity) => {
      const { name } = activity.activity_type;
      const { weight } = activity.activity_type;

      if (!acc[name]) {
        acc[name] = { count: 0, weight };
      }
      acc[name].count++;
      return acc;
    }, {});

    const activityDetails = Object.entries(activityCounts)
      .map(([name, { count, weight }]) => ({
        activity_name: name,
        activity_count: count,
        weight,
      }))
      .sort((a, b) => b.weight - a.weight);

    const totalActivities = activities.length;
    const totalLove = activityDetails.reduce(
      (sum, { activity_count, weight }) => sum + activity_count * weight,
      0,
    );
    const maxWeight = Math.max(...activityDetails.map(({ weight }) => weight));

    return c.json({
      details: activityDetails,
      total_activities: totalActivities,
      total_love: totalLove,
      max_weight: maxWeight,
    });
  })
  .get("/:slackId", async (c) => {
    const { workspace_id } = c.get("user");
    const { slackId } = c.req.param();

    const member = await prisma.members.findUnique({
      where: {
        slack_id: slackId,
        workspace_id,
      },
    });

    return c.json(MemberSchema.parse(member));
  })
  .get("/:slackId/files", async (c) => {
    const { workspace_id } = c.get("user");
    const { slackId } = c.req.param();

    const member = await prisma.members.findUnique({
      where: {
        slack_id: slackId,
        workspace_id,
      },
    });

    return c.json(MemberSchema.parse(member));
  });

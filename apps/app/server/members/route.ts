import { getAuthUser } from "@/queries/getAuthUser";
import { getFilters } from "@conquest/db/helpers/getFilters";
import { orderByParser } from "@conquest/db/helpers/orderByParser";
import { prisma } from "@conquest/db/prisma";
import { listActivitiesIn365Days } from "@conquest/db/queries/activities/listActivitiesIn365Days";
import { getMember } from "@conquest/db/queries/members/getMember";
import { getMemberMetrics } from "@conquest/db/queries/members/getMemberMetrics";
import { FilterSchema } from "@conquest/zod/schemas/filters.schema";
import {
  MemberSchema,
  MemberWithCompanySchema,
} from "@conquest/zod/schemas/member.schema";
import { zValidator } from "@hono/zod-validator";
import { Prisma } from "@prisma/client";
import {
  endOfWeek,
  isAfter,
  isBefore,
  startOfDay,
  subMonths,
  subWeeks,
} from "date-fns";
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
      const orderBy = orderByParser({ id, desc, type: "members" });
      const filterBy = getFilters({ filters });

      const members = await prisma.$queryRaw`
        SELECT 
          m.*,
          CASE 
            WHEN c.id IS NOT NULL THEN to_jsonb(c.*)
            ELSE NULL
          END as company
        FROM members m
        LEFT JOIN companies c ON m.company_id = c.id
        WHERE 
          (
            LOWER(COALESCE(m.first_name, '') || ' ' || COALESCE(m.last_name, '')) LIKE '%' || ${searchParsed} || '%'
            OR LOWER(COALESCE(m.last_name, '') || ' ' || COALESCE(m.first_name, '')) LIKE '%' || ${searchParsed} || '%'
            OR LOWER(m.primary_email) LIKE '%' || ${searchParsed} || '%'
            OR EXISTS (
              SELECT 1 FROM unnest(m.phones) phone
              WHERE LOWER(phone) LIKE '%' || ${searchParsed} || '%'
            )
          )
          AND m.workspace_id = ${workspace_id}
          ${
            filterBy.length > 0
              ? Prisma.sql`AND (${Prisma.join(filterBy, " AND ")})`
              : Prisma.sql``
          }
        GROUP BY m.id, c.id
        ${Prisma.sql([orderBy])}
        LIMIT ${pageSize}
        OFFSET ${(page - 1) * pageSize}
      `;

      return c.json(MemberWithCompanySchema.array().parse(members));
    },
  )
  .get(
    "/count",
    zValidator(
      "query",
      z.object({
        search: z.string(),
        filters: z
          .string()
          .transform((str) => JSON.parse(str))
          .pipe(z.array(FilterSchema)),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { search, filters } = c.req.valid("query");

      const searchParsed = search?.toLowerCase().trim();
      const filterBy = getFilters({ filters });

      const [{ count }] = await prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(DISTINCT m.id)::bigint as count
          FROM members m
          LEFT JOIN companies c ON m.company_id = c.id
          WHERE 
            (
              LOWER(COALESCE(m.first_name, '') || ' ' || COALESCE(m.last_name, '')) LIKE '%' || ${searchParsed} || '%'
              OR LOWER(COALESCE(m.last_name, '') || ' ' || COALESCE(m.first_name, '')) LIKE '%' || ${searchParsed} || '%'
              OR LOWER(m.primary_email) LIKE '%' || ${searchParsed} || '%'
              OR EXISTS (
                SELECT 1 FROM unnest(m.phones) phone
                WHERE LOWER(phone) LIKE '%' || ${searchParsed} || '%'
              )
            )
            AND m.workspace_id = ${workspace_id}
            ${
              filterBy.length > 0
                ? Prisma.sql`AND (${Prisma.join(filterBy, " AND ")})`
                : Prisma.sql``
            }
        `;

      return c.json(Number(count));
    },
  )
  .get(
    "/all-members",
    zValidator(
      "query",
      z.object({
        search: z.string(),
        page: z.coerce.number(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { search, page } = c.req.valid("query");

      const searchParsed = search.toLowerCase().trim();

      const members = await prisma.$queryRaw`
        SELECT 
          m.*,
          CASE 
            WHEN c.id IS NOT NULL THEN to_jsonb(c.*)
            ELSE NULL
          END as company,
          CASE 
            WHEN LOWER(COALESCE(m.first_name, '') || ' ' || COALESCE(m.last_name, '')) = LOWER(${searchParsed}) THEN 1
            WHEN LOWER(COALESCE(m.last_name, '') || ' ' || COALESCE(m.first_name, '')) = LOWER(${searchParsed}) THEN 1
            WHEN LOWER(COALESCE(m.first_name, '') || ' ' || COALESCE(m.last_name, '')) ILIKE LOWER(${searchParsed}) || '%' THEN 2
            ELSE 3
          END as sort_priority
        FROM members m
        LEFT JOIN companies c ON m.company_id = c.id
        WHERE m.workspace_id = ${workspace_id}
        AND (
          LOWER(COALESCE(m.first_name, '')) ILIKE '%' || LOWER(${searchParsed}) || '%'
          OR LOWER(COALESCE(m.last_name, '')) ILIKE '%' || LOWER(${searchParsed}) || '%'
          OR LOWER(COALESCE(m.primary_email, '')) ILIKE '%' || LOWER(${searchParsed}) || '%'
        )
        ORDER BY 
          sort_priority,
          m.first_name,
          m.last_name
        LIMIT 50
        OFFSET ${(page - 1) * 50}
      `;

      return c.json(MemberWithCompanySchema.array().parse(members));
    },
  )
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

    const today = new Date();
    const last3months = startOfDay(subMonths(today, 3));
    const previousWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

    const member = MemberSchema.parse(
      await getMember({
        id: memberId,
        workspace_id,
      }),
    );

    const activities = await listActivitiesIn365Days({ member });

    const last3monthsActivities = activities.filter(
      (activity) =>
        isBefore(activity.created_at, previousWeekEnd) &&
        isAfter(activity.created_at, last3months),
    );

    const { pulse, max_weight } = await getMemberMetrics({
      activities: last3monthsActivities,
      today,
    });

    return c.json({
      activities: last3monthsActivities,
      pulse,
      max_weight,
    });
  })
  .get("/slack/:slackId", async (c) => {
    const { workspace_id } = c.get("user");
    const { slackId } = c.req.param();

    const member = await getMember({
      slack_id: slackId,
      workspace_id,
    });

    return c.json(MemberSchema.parse(member));
  })
  .get("/discourse/:username", async (c) => {
    const { workspace_id } = c.get("user");
    const { username } = c.req.param();

    const member = await getMember({
      discourse_username: username,
      workspace_id,
    });

    return c.json(MemberSchema.parse(member));
  })
  .get("/:slackId/files", async (c) => {
    const { workspace_id } = c.get("user");
    const { slackId } = c.req.param();

    const member = await getMember({
      slack_id: slackId,
      workspace_id,
    });

    return c.json(MemberSchema.parse(member));
  });

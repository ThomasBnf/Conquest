import { prisma } from "@/lib/prisma";
import { getFilters } from "@/queries/helpers/getFilters";
import { getOrderBy } from "@/queries/helpers/getOrderBy";
import { getMember } from "@/queries/members/getMember";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { FilterSchema } from "@conquest/zod/schemas/filters.schema";
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
      const orderBy = getOrderBy(id, desc);
      const filterBy = getFilters({ filters });

      const members = await prisma.$queryRaw`
        SELECT 
          m.*,
          c.id as company_id,
          c.name as company_name
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
        SELECT DISTINCT
          m.*,
          c.id as company_id,
          c.name as company_name,
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
          OR LOWER(COALESCE(m.username, '')) ILIKE '%' || LOWER(${searchParsed}) || '%'
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
  .get("/locations", async (c) => {
    const { workspace_id } = c.get("user");

    const memberLocations = await prisma.members.groupBy({
      by: ["location"],
      where: { workspace_id },
    });

    const locations = memberLocations
      .map((member) => member.location)
      .filter((location) => location !== "");

    return c.json(locations);
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
    const totalPulse = activityDetails.reduce(
      (sum, { activity_count, weight }) => sum + activity_count * weight,
      0,
    );
    const maxWeight = Math.max(...activityDetails.map(({ weight }) => weight));

    return c.json({
      details: activityDetails,
      total_activities: totalActivities,
      total_pulse: totalPulse,
      max_weight: maxWeight,
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
      username,
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

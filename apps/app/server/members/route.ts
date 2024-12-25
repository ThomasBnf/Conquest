import { prisma } from "@/lib/prisma";
import { getFilters } from "@/queries/helpers/getFilters";
import { getOrderBy } from "@/queries/helpers/getOrderBy";
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
            LOWER(COALESCE(m.first_name, '')) LIKE '%' || ${searchParsed} || '%'
            OR LOWER(COALESCE(m.last_name, '')) LIKE '%' || ${searchParsed} || '%'
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
  .get("/:slackId", async (c) => {
    const { workspace_id } = c.get("user");
    const { slackId } = c.req.param();

    const member = await prisma.members.findUnique({
      where: {
        slack_id_workspace_id: {
          slack_id: slackId,
          workspace_id,
        },
      },
    });

    return c.json(MemberSchema.parse(member));
  })
  .get("/:slackId/files", async (c) => {
    const { workspace_id } = c.get("user");
    const { slackId } = c.req.param();

    const member = await prisma.members.findUnique({
      where: {
        slack_id_workspace_id: {
          slack_id: slackId,
          workspace_id,
        },
      },
    });

    return c.json(MemberSchema.parse(member));
  });

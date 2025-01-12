import { prisma } from "@/lib/prisma";
import { getFilters } from "@/queries/helpers/getFilters";
import { getOrderBy } from "@/queries/helpers/getOrderBy";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { FilterSchema } from "@conquest/zod/schemas/filters.schema";
import {
  LogSchema,
  MemberSchema,
  MemberWithCompanySchema,
} from "@conquest/zod/schemas/member.schema";
import { zValidator } from "@hono/zod-validator";
import { Prisma } from "@prisma/client";
import { eachDayOfInterval, format } from "date-fns";
import { Hono } from "hono";
import { z } from "zod";

export const dashboard = new Hono()
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get(
    "/total-members",
    zValidator(
      "query",
      z.object({
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { from, to } = c.req.valid("query");

      const countMembers = await prisma.members.count({
        where: {
          created_at: {
            lt: from,
          },
          workspace_id,
        },
      });

      const members = await prisma.members.findMany({
        where: {
          created_at: {
            gte: from,
            lte: to,
          },
          workspace_id,
        },
        orderBy: {
          created_at: "asc",
        },
      });

      const allDates = eachDayOfInterval({ start: from, end: to }).map((date) =>
        format(date, "PP"),
      );

      const membersData = allDates.reduce<Record<string, number>>(
        (acc, date) => {
          const membersOnDate = members.filter(
            (member) => format(member.created_at, "PP") === date,
          ).length;

          const previousDate = allDates[allDates.indexOf(date) - 1];
          const previousTotal = previousDate ? acc[previousDate] : countMembers;

          acc[date] = (previousTotal ?? 0) + membersOnDate;
          return acc;
        },
        {},
      );

      return c.json({
        total_members: countMembers + members.length,
        membersData,
      });
    },
  )
  .get(
    "/new-members",
    zValidator(
      "query",
      z.object({
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { from, to } = c.req.valid("query");

      const members = await prisma.members.findMany({
        where: {
          workspace_id,
          created_at: {
            gte: from,
            lte: to,
          },
        },
        orderBy: {
          created_at: "asc",
        },
      });

      const allDates = eachDayOfInterval({ start: from, end: to }).map((date) =>
        format(date, "PP"),
      );

      const membersData = members.reduce<Record<string, number>>(
        (acc, member) => {
          const date = format(member.created_at, "PP");
          const previousDates = Object.keys(acc);
          const lastDate = previousDates[previousDates.length - 1];
          const previousTotal = lastDate ? acc[lastDate] : 0;

          acc[date] = (acc[date] ?? previousTotal ?? 0) + 1;
          return acc;
        },
        Object.fromEntries(
          allDates.map((date) => {
            return [date, 0];
          }),
        ),
      );

      return c.json({
        new_members: members.length,
        membersData,
      });
    },
  )
  .get(
    "/active-members",
    zValidator(
      "query",
      z.object({
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { from, to } = c.req.valid("query");

      const allDates = eachDayOfInterval({ start: from, end: to });

      const activeMembersByDay = await Promise.all(
        allDates.map(async (date) => {
          const nextDay = new Date(date);
          nextDay.setDate(date.getDate() + 1);

          const activeMembers = await prisma.members.count({
            where: {
              workspace_id,
              activities: {
                some: {
                  created_at: {
                    gte: date,
                    lt: nextDay,
                  },
                },
              },
            },
          });

          return {
            date: format(date, "PP"),
            count: activeMembers,
          };
        }),
      );

      const membersData = Object.fromEntries(
        activeMembersByDay.map(({ date, count }) => [date, count]),
      );

      const totalActiveMembers = await prisma.members.count({
        where: {
          workspace_id,
          activities: {
            some: {
              created_at: {
                gte: from,
                lte: to,
              },
            },
          },
        },
      });

      return c.json({
        active_members: totalActiveMembers,
        membersData,
      });
    },
  )
  .get(
    "/top-members",
    zValidator(
      "query",
      z.object({
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { from, to } = c.req.valid("query");

      const members = await prisma.members.findMany({
        where: {
          workspace_id,
          activities: {
            some: {
              created_at: {
                gte: from,
                lte: to,
              },
            },
          },
        },
        include: {
          activities: {
            where: {
              created_at: {
                gte: from,
                lte: to,
              },
            },
            include: {
              activity_type: true,
            },
          },
        },
        take: 10,
      });

      const topMembers = members
        .map((member) => ({
          ...member,
          pulse: member.activities.reduce((acc, activity) => {
            return acc + activity.activity_type.weight;
          }, 0),
        }))
        .sort((a, b) => b.pulse - a.pulse)
        .filter((member) => member.pulse > 0);

      return c.json(MemberSchema.array().parse(topMembers));
    },
  )
  .get(
    "/members-levels",
    zValidator(
      "query",
      z.object({
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { from, to } = c.req.valid("query");

      const members = await prisma.members.findMany({
        where: {
          workspace_id,
        },
        include: {
          company: true,
        },
      });

      const max: Record<string, number> = {
        explorer: 0,
        active: 0,
        contributor: 0,
        ambassador: 0,
      };
      const current: Record<string, number> = {
        explorer: 0,
        active: 0,
        contributor: 0,
        ambassador: 0,
      };

      const getLevelCategory = (level: number) => {
        if (level >= 1 && level <= 3) return "explorer";
        if (level >= 4 && level <= 6) return "active";
        if (level >= 7 && level <= 9) return "contributor";
        if (level >= 10 && level <= 12) return "ambassador";
        return null;
      };

      for (const member of members) {
        const logs = LogSchema.array().parse(member.logs);

        const filteredLogs = logs.filter(
          (log) =>
            new Date(log.date) >= from &&
            new Date(log.date) <= to &&
            log.level > 0,
        );

        if (filteredLogs.length > 0) {
          const maxLevel = Math.max(...filteredLogs.map((log) => log.level));
          const maxCategory = getLevelCategory(maxLevel);
          if (maxCategory) {
            max[maxCategory] = (max[maxCategory] ?? 0) + 1;
          }
        }

        if (member.level > 0) {
          const currentCategory = getLevelCategory(member.level);
          if (currentCategory) {
            current[currentCategory] = (current[currentCategory] ?? 0) + 1;
          }
        }
      }

      return c.json({
        max,
        current,
      });
    },
  )
  .get(
    "/top-channels",
    zValidator(
      "query",
      z.object({
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { from, to } = c.req.valid("query");

      const channels = await prisma.channels.findMany({
        where: {
          workspace_id,
        },
        include: {
          _count: {
            select: {
              activities: {
                where: {
                  created_at: {
                    gte: from,
                    lte: to,
                  },
                },
              },
            },
          },
        },
        take: 10,
      });

      const sortedChannels = channels.sort(
        (a, b) => b._count.activities - a._count.activities,
      );

      return c.json(sortedChannels);
    },
  )
  .get(
    "/top-activity-types",
    zValidator(
      "query",
      z.object({
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { from, to } = c.req.valid("query");

      const activities = await prisma.activities.findMany({
        where: {
          workspace_id,
          created_at: {
            gte: from,
            lte: to,
          },
        },
        include: {
          activity_type: true,
        },
      });

      const result = activities.reduce<
        Record<string, { type: string; count: number }>
      >((acc, activity) => {
        const source = activity.activity_type?.source;
        const type = `${source?.slice(0, 1).toUpperCase()}${source?.slice(1).toLowerCase()} - ${activity.activity_type?.name}`;
        if (!type) return acc;

        if (!acc[type]) {
          acc[type] = {
            type,
            count: 0,
          };
        }
        acc[type].count += 1;
        return acc;
      }, {});

      return c.json(Object.values(result).sort((a, b) => b.count - a.count));
    },
  )
  .get(
    "/engagement",
    zValidator(
      "query",
      z.object({
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { from, to } = c.req.valid("query");

      const totalMembers = await prisma.members.count({
        where: {
          workspace_id,
        },
      });

      const activeMembersByDate = await prisma.$queryRaw<
        Array<{ date: Date; unique_members: bigint }>
      >`
        SELECT 
          DATE(created_at) as date,
          COUNT(DISTINCT member_id) as unique_members
        FROM activities
        WHERE workspace_id = ${workspace_id}
          AND created_at >= ${from}
          AND created_at <= ${to}
        GROUP BY DATE(created_at)
      `;

      const allDates = eachDayOfInterval({ start: from, end: to });

      const dailyEngagement = allDates.map((date) => {
        const formattedDate = format(date, "PP");
        const dayActivities = activeMembersByDate.find(
          (activity) => format(activity.date, "PP") === formattedDate,
        );

        const activeMembers = Number(dayActivities?.unique_members ?? 0);
        const percentage =
          totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

        return {
          date: formattedDate,
          percentage: Math.round(percentage * 100) / 100,
        };
      });

      return c.json(dailyEngagement);
    },
  )
  .get(
    "/at-risk-members",
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
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { search, id, desc, page, pageSize, filters, from, to } =
        c.req.valid("query");

      const searchParsed = search.toLowerCase().trim();
      const orderBy = getOrderBy({ id, desc });
      const filterBy = getFilters({ filters });

      const count = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT m.id) as count
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
          AND m.level >= 3
          AND NOT EXISTS (
            SELECT 1 
            FROM activities a 
            WHERE a.member_id = m.id
              AND a.created_at >= ${from}
              AND a.created_at <= ${to}
          )
          ${
            filterBy.length > 0
              ? Prisma.sql`AND (${Prisma.join(filterBy, " AND ")})`
              : Prisma.sql``
          }
      `;

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
          AND m.level >= 3
          AND NOT EXISTS (
            SELECT 1 
            FROM activities a 
            WHERE a.member_id = m.id
              AND a.created_at >= ${from}
              AND a.created_at <= ${to}
          )
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

      return c.json({
        members: MemberWithCompanySchema.array().parse(members),
        count: Number(count[0].count),
      });
    },
  )
  .get(
    "/potential-ambassadors",
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
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { search, id, desc, page, pageSize, filters, from, to } =
        c.req.valid("query");

      const searchParsed = search.toLowerCase().trim();
      const orderBy = getOrderBy({ id, desc });
      const filterBy = getFilters({ filters });

      const count = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT m.id) as count
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
          AND m.level >= 7
          AND m.level < 10
          AND EXISTS (
            SELECT 1 
            FROM activities a 
            WHERE a.member_id = m.id
              AND a.created_at >= ${from}
              AND a.created_at <= ${to}
          )
          ${
            filterBy.length > 0
              ? Prisma.sql`AND (${Prisma.join(filterBy, " AND ")})`
              : Prisma.sql``
          }
      `;

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
          AND m.level >= 7
          AND m.level < 10
          AND EXISTS (
            SELECT 1 
            FROM activities a 
            WHERE a.member_id = m.id
              AND a.created_at >= ${from}
              AND a.created_at <= ${to}
          )
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

      return c.json({
        members: MemberWithCompanySchema.array().parse(members),
        count: Number(count[0].count),
      });
    },
  );

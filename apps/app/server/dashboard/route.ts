import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { zValidator } from "@hono/zod-validator";
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

      const members = await prisma.members.findMany({
        where: {
          workspace_id,
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
        total_members: members.length,
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
          joined_at: {
            gte: from,
            lte: to,
          },
        },
        orderBy: {
          joined_at: "asc",
        },
      });

      const allDates = eachDayOfInterval({ start: from, end: to }).map((date) =>
        format(date, "PP"),
      );

      const membersData = members.reduce<Record<string, number>>(
        (acc, member) => {
          const date = format(member.joined_at ?? "", "PP");
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
          love: member.activities.reduce((acc, activity) => {
            return acc + activity.activity_type.weight;
          }, 0),
        }))
        .sort((a, b) => b.love - a.love)
        .filter((member) => member.love > 0);

      return c.json(MemberSchema.array().parse(topMembers));
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
        orderBy: {
          activities: {
            _count: "desc",
          },
        },
        take: 10,
      });

      return c.json(channels);
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
        const type = `${activity.activity_type?.source} - ${activity.activity_type?.name}`;
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

      const activeMembersByDate = await prisma.activities.groupBy({
        by: ["created_at"],
        where: {
          workspace_id,
          created_at: {
            gte: from,
            lte: to,
          },
        },
        _count: {
          member_id: true,
        },
      });

      const allDates = eachDayOfInterval({ start: from, end: to });

      const dailyEngagement = allDates.map((date) => {
        const formattedDate = format(date, "PP");
        const dayActivities = activeMembersByDate.find(
          (activity) => format(activity.created_at, "PP") === formattedDate,
        );

        const activeMembers = dayActivities?._count.member_id ?? 0;
        const percentage =
          totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

        return {
          date: formattedDate,
          percentage: Math.round(percentage * 100) / 100,
        };
      });

      return c.json(dailyEngagement);
    },
  );

import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { SOURCE, Source } from "@conquest/zod/enum/source.enum";
import { ProfileAttributesSchema } from "@conquest/zod/schemas/profile.schema";
import {
  compareAsc,
  differenceInDays,
  endOfDay,
  format,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import z from "zod";

export const engagementRate = protectedProcedure
  .input(
    z.object({
      dateRange: z
        .object({
          from: z.coerce.date().optional(),
          to: z.coerce.date().optional(),
        })
        .optional(),
      sources: z.array(SOURCE),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { dateRange, sources } = input;
    const { from, to } = dateRange ?? {};

    if (!from || !to) {
      return {
        engagementRate: 0,
        growthRate: 0,
        days: [],
      };
    }

    const difference = differenceInDays(to, from);
    const previousFrom = startOfDay(subDays(from, difference));
    const previousTo = endOfDay(subDays(from, 1));
    const currentFrom = startOfDay(from);
    const currentTo = endOfDay(to);

    const [
      totalMembers,
      previousTotalMembers,
      activeMembers,
      previousActiveMembers,
      members,
      activities,
    ] = await Promise.all([
      prisma.member.count({
        where: {
          createdAt: { lte: currentTo },
          workspaceId,
        },
      }),

      prisma.member.count({
        where: {
          createdAt: { lte: previousTo },
          workspaceId,
        },
      }),

      prisma.member.count({
        where: {
          activities: {
            some: {
              createdAt: {
                gte: currentFrom,
                lte: currentTo,
              },
            },
          },
          workspaceId,
        },
      }),

      prisma.member.count({
        where: {
          activities: {
            some: {
              createdAt: {
                gte: previousFrom,
                lte: previousTo,
              },
            },
          },
          workspaceId,
        },
      }),

      prisma.member.findMany({
        where: {
          createdAt: {
            gte: currentFrom,
            lte: currentTo,
          },
          profiles: {
            some: {
              OR: sources.map((source) => ({
                attributes: {
                  path: ["source"],
                  equals: source,
                },
              })),
            },
          },
          workspaceId,
        },
        include: {
          profiles: true,
        },
      }),

      prisma.activity.findMany({
        where: {
          createdAt: {
            gte: currentFrom,
            lte: currentTo,
          },
          source: {
            in: sources,
          },
          workspaceId,
        },
      }),
    ]);

    const engagementRate =
      totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;
    const previousEngagementRate =
      previousTotalMembers > 0
        ? (previousActiveMembers / previousTotalMembers) * 100
        : 0;

    const growthRate =
      previousEngagementRate === 0
        ? 0
        : ((engagementRate - previousEngagementRate) / previousEngagementRate) *
          100;

    const calculateDailyEngagementRate = () => {
      const activitiesBySourceDate: Record<string, Record<string, number>> = {};
      const membersBySourceDate: Record<string, Record<string, number>> = {};
      const dates: string[] = [];

      for (const activity of activities) {
        if (!activity.source) continue;

        const date = format(activity.createdAt, "MMM dd");

        if (!dates.includes(date)) {
          dates.push(date);
        }

        if (!activitiesBySourceDate[activity.source]) {
          activitiesBySourceDate[activity.source] = {};
        }

        activitiesBySourceDate[activity.source]![date] =
          (activitiesBySourceDate[activity.source]![date] || 0) + 1;
      }

      for (const member of members) {
        const date = format(member.createdAt, "MMM dd");

        if (!dates.includes(date)) {
          dates.push(date);
        }

        const memberSources: Source[] = [];

        for (const profile of member.profiles) {
          const attributes = ProfileAttributesSchema.parse(profile.attributes);
          if (sources.includes(attributes.source)) {
            memberSources.push(attributes.source);
          }
        }

        for (const source of memberSources) {
          if (!membersBySourceDate[source]) {
            membersBySourceDate[source] = {};
          }

          membersBySourceDate[source][date] =
            (membersBySourceDate[source][date] || 0) + 1;
        }
      }

      const sortedDates = dates.sort((a, b) => {
        const year = format(currentFrom, "yyyy");
        const dateA = parseISO(`${year} ${a}`);
        const dateB = parseISO(`${year} ${b}`);
        return compareAsc(dateA, dateB);
      });

      const dailyEngagement: { day: string; [key: string]: string | number }[] =
        [];

      for (const date of sortedDates) {
        const dayData: { day: string; [key: string]: string | number } = {
          day: date,
        };

        for (const source of sources) {
          const memberCount = membersBySourceDate[source]?.[date] || 0;
          const activityCount = activitiesBySourceDate[source]?.[date] || 0;

          dayData[source] =
            memberCount > 0
              ? Math.round((activityCount / memberCount) * 100) / 100
              : 0;
        }

        dailyEngagement.push(dayData);
      }

      return dailyEngagement;
    };

    const days = calculateDailyEngagementRate();

    return {
      engagementRate: Math.round(engagementRate * 100) / 100,
      growthRate: Math.round(growthRate * 100) / 100,
      days,
    };
  });

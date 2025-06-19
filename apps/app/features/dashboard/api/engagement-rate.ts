import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { SOURCE, Source } from "@conquest/zod/enum/source.enum";
import { ProfileAttributesSchema } from "@conquest/zod/schemas/profile.schema";
import { differenceInDays, endOfWeek, startOfWeek, subDays } from "date-fns";
import z from "zod";
import { listWeeks } from "../helpers/listWeeks";

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
        previousEngagementRate: 0,
        weeks: [],
      };
    }

    const days = differenceInDays(to, from);
    const previousFrom = subDays(from, days);
    const previousTo = subDays(from, 1);

    const [
      total,
      previousTotal,
      activeMembers,
      previousActiveMembers,
      allMembersData,
    ] = await Promise.all([
      prisma.member.count({
        where: {
          workspaceId,
          createdAt: { lte: to },
        },
      }),
      prisma.member.count({
        where: {
          workspaceId,
          createdAt: { lte: previousTo },
        },
      }),
      prisma.activity.findMany({
        where: {
          workspaceId,
          createdAt: { gte: from, lte: to },
        },
        select: { memberId: true },
        distinct: ["memberId"],
      }),
      prisma.activity.findMany({
        where: {
          workspaceId,
          createdAt: { gte: previousFrom, lte: previousTo },
        },
        select: { memberId: true },
        distinct: ["memberId"],
      }),
      prisma.member.findMany({
        where: {
          workspaceId,
          createdAt: { lte: to },
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
        },
        select: {
          id: true,
          createdAt: true,
          profiles: {
            where: {
              OR: sources.map((source) => ({
                attributes: {
                  path: ["source"],
                  equals: source,
                },
              })),
            },
            select: {
              attributes: true,
            },
          },
          activities: {
            where: {
              createdAt: { gte: from, lte: to },
            },
            select: {
              createdAt: true,
            },
          },
        },
      }),
    ]);

    const uniqueActiveMembers = activeMembers.length;
    const previousUniqueActiveMembers = previousActiveMembers.length;

    const engagementRate = total > 0 ? (uniqueActiveMembers / total) * 100 : 0;
    const previousEngagementRate =
      previousTotal > 0
        ? (previousUniqueActiveMembers / previousTotal) * 100
        : 0;
    const growthRate =
      previousEngagementRate > 0
        ? ((engagementRate - previousEngagementRate) / previousEngagementRate) *
          100
        : 0;

    const weeks = listWeeks(from, to);

    const chartData = weeks.map((week) => {
      const weekStart = startOfWeek(new Date(week));
      const weekEnd = endOfWeek(new Date(week));
      const weekData: Partial<Record<Source, number>> = {};

      const membersBySource: Record<
        string,
        { total: Set<string>; active: Set<string> }
      > = {};

      for (const source of sources) {
        membersBySource[source] = { total: new Set(), active: new Set() };
      }

      for (const member of allMembersData) {
        if (member.createdAt > weekEnd) continue;

        const memberSources = new Set<string>();

        for (const profile of member.profiles) {
          const attributes = ProfileAttributesSchema.parse(profile.attributes);
          if (attributes.source && sources.includes(attributes.source)) {
            memberSources.add(attributes.source);
          }
        }

        const hasWeekActivity = member.activities.some(
          (activity) =>
            activity.createdAt >= weekStart && activity.createdAt <= weekEnd,
        );

        for (const source of memberSources) {
          membersBySource[source]?.total.add(member.id);
          if (hasWeekActivity) {
            membersBySource[source]?.active.add(member.id);
          }
        }
      }

      for (const source of sources) {
        const totalCount = membersBySource[source]?.total.size ?? 0;
        const activeCount = membersBySource[source]?.active.size ?? 0;
        const rate = totalCount > 0 ? (activeCount / totalCount) * 100 : 0;
        weekData[source] = Math.round(rate * 100) / 100;
      }

      return {
        week,
        ...weekData,
      };
    });

    return {
      engagementRate,
      growthRate,
      weeks: chartData,
    };
  });

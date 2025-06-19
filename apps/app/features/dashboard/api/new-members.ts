import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { SOURCE, Source } from "@conquest/zod/enum/source.enum";
import { ProfileAttributesSchema } from "@conquest/zod/schemas/profile.schema";
import { differenceInDays, endOfWeek, startOfWeek, subDays } from "date-fns";
import z from "zod";
import { listWeeks } from "../helpers/listWeeks";

export const newMembers = protectedProcedure
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
        total: 0,
        previousTotal: 0,
        weeks: [],
      };
    }

    const days = differenceInDays(to, from);
    const previousFrom = subDays(from, days);
    const previousTo = subDays(from, 1);

    const [total, previousTotal, profiles] = await Promise.all([
      prisma.member.count({
        where: {
          workspaceId,
          createdAt: {
            gte: from,
            lte: to,
          },
        },
      }),
      prisma.member.count({
        where: {
          workspaceId,
          createdAt: {
            gte: previousFrom,
            lte: previousTo,
          },
        },
      }),
      prisma.profile.findMany({
        where: {
          workspaceId,
          createdAt: {
            gte: from,
            lte: to,
          },
          OR: sources.map((source) => ({
            attributes: {
              path: ["source"],
              equals: source,
            },
          })),
        },
        select: {
          memberId: true,
          attributes: true,
          createdAt: true,
        },
      }),
    ]);

    const weeks = listWeeks(from, to);

    const chartData = weeks.map((week) => {
      const weekStart = startOfWeek(new Date(week));
      const weekEnd = endOfWeek(new Date(week));
      const weekData: Partial<Record<Source, number>> = {};

      const weekProfiles = profiles.filter(
        (profile) =>
          profile.createdAt >= weekStart && profile.createdAt <= weekEnd,
      );

      const profilesBySource: Record<string, number> = {};
      for (const source of sources) {
        profilesBySource[source] = 0;
      }

      for (const profile of weekProfiles) {
        const attributes = ProfileAttributesSchema.parse(profile.attributes);
        if (attributes.source && sources.includes(attributes.source)) {
          profilesBySource[attributes.source] =
            (profilesBySource[attributes.source] ?? 0) + 1;
        }
      }

      for (const source of sources) {
        weekData[source] = profilesBySource[source];
      }

      return {
        week,
        ...weekData,
      };
    });

    const growthRate =
      previousTotal > 0 ? (total - previousTotal) / previousTotal : 0;

    return {
      total,
      growthRate,
      weeks: chartData,
    };
  });

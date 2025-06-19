import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { SOURCE, Source } from "@conquest/zod/enum/source.enum";
import { ProfileAttributesSchema } from "@conquest/zod/schemas/profile.schema";
import { endOfDay, endOfWeek, subDays } from "date-fns";
import z from "zod";
import { listWeeks } from "../helpers/listWeeks";

export const totalMembers = protectedProcedure
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
        growthRate: 0,
        weeks: [],
      };
    }

    const previousFrom = endOfDay(subDays(from, 1));

    const total = await prisma.member.count({
      where: {
        workspaceId,
        createdAt: {
          lte: to,
        },
      },
    });

    const previousTotal = await prisma.member.count({
      where: {
        workspaceId,
        createdAt: {
          lte: previousFrom,
        },
      },
    });

    const profiles = await prisma.profile.findMany({
      where: {
        workspaceId,
        createdAt: {
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
    });

    const weeks = listWeeks(from, to);

    const profilesBySource = profiles.reduce(
      (acc, profile) => {
        const attributes = ProfileAttributesSchema.parse(profile.attributes);
        const source = attributes.source;

        if (source && sources.includes(source)) {
          acc[source] = acc[source] || [];
          acc[source].push(profile);
        }
        return acc;
      },
      {} as Record<string, typeof profiles>,
    );

    const chartData = weeks.map((week) => {
      const weekData: Partial<Record<Source, number>> = {};

      for (const source of sources) {
        const sourceProfiles = profilesBySource[source] || [];

        const cumulativeCount = sourceProfiles.filter(
          (profile) => profile.createdAt <= endOfWeek(new Date(week)),
        ).length;

        weekData[source] = cumulativeCount;
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

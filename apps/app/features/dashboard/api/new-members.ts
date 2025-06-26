import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { SOURCE, Source } from "@conquest/zod/enum/source.enum";
import { ProfileAttributesSchema } from "@conquest/zod/schemas/profile.schema";
import { addDays, differenceInDays, endOfDay, subDays } from "date-fns";
import z from "zod";
import { listDays } from "../helpers/listDays";

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
        growthRate: 0,
        weeks: [],
      };
    }

    const daysCount = differenceInDays(to, from);
    const previousFrom = subDays(from, daysCount);
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

    const days = listDays(from, to);

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

    const chartData = days.map((day) => {
      const dayData: Partial<Record<Source, number>> = {};

      for (const source of sources) {
        const sourceProfiles = profilesBySource[source] || [];

        const dayIndex = days.indexOf(day);
        const currentDate = new Date(from);
        const adjustedDate = addDays(currentDate, dayIndex);

        const count = sourceProfiles.filter((profile) => {
          const profileDate = new Date(profile.createdAt);
          return (
            profileDate.getDate() === adjustedDate.getDate() &&
            profileDate.getMonth() === adjustedDate.getMonth() &&
            profileDate.getFullYear() === adjustedDate.getFullYear()
          );
        }).length;

        dayData[source] = count;
      }

      return {
        day,
        ...dayData,
      };
    });

    const growthRate =
      previousTotal > 0 ? (total - previousTotal) / previousTotal : 0;

    return {
      total,
      growthRate,
      days: chartData,
    };
  });

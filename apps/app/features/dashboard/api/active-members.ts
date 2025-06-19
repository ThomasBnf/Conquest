import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { SOURCE, Source } from "@conquest/zod/enum/source.enum";
import { ProfileAttributesSchema } from "@conquest/zod/schemas/profile.schema";
import { differenceInDays, endOfWeek, startOfWeek, subDays } from "date-fns";
import z from "zod";
import { listWeeks } from "../helpers/listWeeks";

export const activeMembers = protectedProcedure
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

    const [membersData, total, previousTotal] = await Promise.all([
      prisma.member.findMany({
        where: {
          workspaceId,
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
          activities: {
            some: {
              createdAt: {
                gte: previousFrom,
                lte: to,
              },
            },
          },
        },
        select: {
          id: true,
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
              createdAt: {
                gte: previousFrom,
                lte: to,
              },
            },
            select: {
              createdAt: true,
            },
          },
        },
      }),
      prisma.member.count({
        where: {
          workspaceId,
          activities: {
            some: {
              createdAt: {
                gte: from,
                lte: to,
              },
            },
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
        },
      }),
      prisma.member.count({
        where: {
          workspaceId,
          activities: {
            some: {
              createdAt: {
                gte: previousFrom,
                lte: previousTo,
              },
            },
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
        },
      }),
    ]);

    const weeks = listWeeks(from, to);

    const chartData = weeks.map((week) => {
      const weekStart = startOfWeek(new Date(week));
      const weekEnd = endOfWeek(new Date(week));
      const weekData: Partial<Record<Source, number>> = {};

      const membersBySource: Record<string, Set<string>> = {};
      for (const source of sources) {
        membersBySource[source] = new Set();
      }

      for (const member of membersData) {
        const hasWeekActivity = member.activities.some(
          (activity) =>
            activity.createdAt >= weekStart && activity.createdAt <= weekEnd,
        );

        if (hasWeekActivity) {
          for (const profile of member.profiles) {
            const attributes = ProfileAttributesSchema.parse(
              profile.attributes,
            );
            if (attributes.source && sources.includes(attributes.source)) {
              membersBySource[attributes.source]?.add(member.id);
            }
          }
        }
      }

      for (const source of sources) {
        weekData[source] = membersBySource[source]?.size ?? 0;
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

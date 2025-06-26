import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { SOURCE, Source } from "@conquest/zod/enum/source.enum";
import { ProfileAttributesSchema } from "@conquest/zod/schemas/profile.schema";
import { addDays, differenceInDays, isSameDay, subDays } from "date-fns";
import z from "zod";
import { listDays } from "../helpers/listDays";

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
        growthRate: 0,
        weeks: [],
      };
    }

    const daysCount = differenceInDays(to, from);
    const previousFrom = subDays(from, daysCount);
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

    const days = listDays(from, to);
    const membersBySource: Record<string, Record<string, Date[]>> = {};

    for (const member of membersData) {
      const memberSources = member.profiles
        .map((profile) => {
          const attributes = ProfileAttributesSchema.parse(profile.attributes);
          return attributes.source;
        })
        .filter((source) => sources.includes(source));

      const activityDates = member.activities.map(
        (activity) => activity.createdAt,
      );

      for (const source of memberSources) {
        if (!membersBySource[source]) {
          membersBySource[source] = {};
        }

        if (!membersBySource[source][member.id]) {
          membersBySource[source][member.id] = activityDates;
        }
      }
    }

    const chartData = days.map((day) => {
      const dayData: Partial<Record<Source, number>> = {};
      const dayIndex = days.indexOf(day);
      const currentDate = new Date(from);
      const dayDate = addDays(currentDate, dayIndex);

      for (const source of sources) {
        let activeMembersCount = 0;

        for (const memberId in membersBySource[source]) {
          const activityDates = membersBySource[source][memberId];
          if (activityDates?.some((date) => isSameDay(date, dayDate))) {
            activeMembersCount++;
          }
        }

        dayData[source] = activeMembersCount;
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

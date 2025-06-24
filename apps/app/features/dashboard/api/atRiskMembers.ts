import { prisma } from "@conquest/db/prisma";
import { differenceInDays, subDays } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../../../server/trpc";

export const atRiskMembers = protectedProcedure
  .input(
    z.object({
      dateRange: z
        .object({
          from: z.coerce.date().optional(),
          to: z.coerce.date().optional(),
        })
        .optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { dateRange } = input;
    const { from, to } = dateRange ?? {};

    if (!from || !to) {
      return {
        current: 0,
        previous: 0,
        variation: 0,
      };
    }

    const days = differenceInDays(to, from);
    const previousFrom = subDays(from, days);
    const previousTo = subDays(from, 1);

    const [currentCount, previousCount] = await Promise.all([
      prisma.member.count({
        where: {
          workspaceId,
          isStaff: false,
          pulse: {
            gte: 20,
          },
          activities: {
            none: {
              workspaceId,
              createdAt: {
                gte: from,
                lte: to,
              },
            },
          },
        },
      }),
      prisma.member.count({
        where: {
          workspaceId,
          isStaff: false,
          pulse: {
            gte: 20,
          },
          activities: {
            none: {
              workspaceId,
              createdAt: {
                gte: previousFrom,
                lte: previousTo,
              },
            },
          },
        },
      }),
    ]);

    const variation =
      previousCount > 0
        ? ((currentCount - previousCount) / previousCount) * 100
        : 0;

    return {
      current: currentCount,
      previous: previousCount,
      variation,
    };
  });

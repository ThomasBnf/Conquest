import { protectedProcedure } from "@/server/trpc";
import { getPulseScore } from "@conquest/db/helpers/getPulseScore";
import { prisma } from "@conquest/db/prisma";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import z from "zod";

export const leaderboard = protectedProcedure
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

    if (!from || !to) return [];

    const members = await prisma.member.findMany({
      where: {
        workspaceId,
        activities: {
          some: {
            createdAt: { gte: from, lte: to },
          },
        },
      },
      include: {
        activities: {
          include: {
            activityType: true,
          },
        },
      },
    });

    return members
      .map((member) => ({
        ...member,
        pulse: getPulseScore({
          activities: member.activities as ActivityWithType[],
        }),
      }))
      .sort((a, b) => b.pulse - a.pulse)
      .slice(0, 10);
  });

import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { ActivityHeatmapSchema } from "@conquest/zod/schemas/activity.schema";
import { format, startOfDay, subDays } from "date-fns";
import { z } from "zod";

export const heatmap = protectedProcedure
  .input(
    z.object({
      memberId: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { memberId } = input;

    const today = new Date();
    const last365days = subDays(today, 365);

    const activities = await prisma.activity.findMany({
      where: {
        workspaceId,
        ...(memberId ? { memberId } : { member: { isStaff: false } }),
        createdAt: {
          gte: last365days,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const groupedByDate = activities.reduce(
      (acc, activity) => {
        const dateKey = format(startOfDay(activity.createdAt), "yyyy-MM-dd");
        acc[dateKey] = (acc[dateKey] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const formattedData = Object.entries(groupedByDate).map(
      ([date, count]) => ({
        date,
        count,
      }),
    );

    return ActivityHeatmapSchema.array().parse(formattedData);
  });

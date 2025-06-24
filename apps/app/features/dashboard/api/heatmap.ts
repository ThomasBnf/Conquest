import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { ActivityHeatmapSchema } from "@conquest/zod/schemas/activity.schema";
import { format, subDays } from "date-fns";
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

    const result = await prisma.activity.groupBy({
      by: ["createdAt"],
      where: {
        workspaceId,
        member: {
          ...(memberId ? {} : { isStaff: false }),
        },
        ...(memberId ? { memberId } : {}),
        createdAt: {
          gte: last365days,
        },
      },
      _count: {
        id: true,
      },
    });

    const formattedData = result.map((item) => ({
      date: format(item.createdAt, "yyyy-MM-dd"),
      count: item._count.id,
    }));

    return ActivityHeatmapSchema.array().parse(formattedData);
  });

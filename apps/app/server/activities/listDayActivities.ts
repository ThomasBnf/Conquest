import { prisma } from "@conquest/db/prisma";
import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import { endOfDay, startOfDay } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listDayActivities = protectedProcedure
  .input(
    z.object({
      date: z.coerce.date(),
      memberId: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { date, memberId } = input;

    const startDay = startOfDay(date);
    const endDay = endOfDay(date);

    const activities = await prisma.activity.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startDay,
          lte: endDay,
        },
        ...(memberId
          ? { memberId }
          : {
              member: {
                isStaff: false,
              },
            }),
      },
      include: {
        activityType: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ActivityWithTypeSchema.array().parse(activities);
  });

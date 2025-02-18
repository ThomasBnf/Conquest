import { prisma } from "@conquest/db/prisma";
import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import {
  eachDayOfInterval,
  endOfToday,
  isSameDay,
  startOfDay,
  subDays,
} from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getMemberActivitiesCount = protectedProcedure
  .input(
    z.object({
      memberId: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { memberId } = input;

    const today = new Date();
    const from = startOfDay(subDays(today, 364));
    const to = endOfToday();

    const intervalDay = eachDayOfInterval({
      start: from,
      end: to,
    });

    const activities = await prisma.activity.findMany({
      where: {
        member_id: memberId,
        workspace_id,
        created_at: {
          gte: from,
          lte: to,
        },
      },
      include: {
        activity_type: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    const activitiesPerDay = intervalDay.map((day) => {
      const dayActivities = activities.filter((activity) =>
        isSameDay(activity.created_at, day),
      );
      return {
        date: day,
        activities: ActivityWithTypeSchema.array().parse(dayActivities),
      };
    });

    return activitiesPerDay;
  });

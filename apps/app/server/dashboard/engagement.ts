import { prisma } from "@conquest/db/prisma";
import { eachDayOfInterval, format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const engagement = protectedProcedure
  .input(
    z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { from, to } = input;
    const { workspace_id } = user;

    const totalMembers = await prisma.member.count({
      where: {
        workspace_id,
      },
    });

    const activeMembersByDate = await prisma.$queryRaw<
      Array<{ date: Date; unique_members: bigint }>
    >`
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT member_id) as unique_members
      FROM activities
      WHERE workspace_id = ${workspace_id}
        AND created_at >= ${from}
        AND created_at <= ${to}
      GROUP BY DATE(created_at)
    `;

    const allDates = eachDayOfInterval({ start: from, end: to });

    const dailyEngagement = allDates.map((date) => {
      const formattedDate = format(date, "PP");
      const dayActivities = activeMembersByDate.find(
        (activity) => format(activity.date, "PP") === formattedDate,
      );

      const activeMembers = Number(dayActivities?.unique_members ?? 0);
      const percentage =
        totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

      return {
        date: formattedDate,
        percentage: Math.round(percentage * 100) / 100,
      };
    });

    return {
      engagement: dailyEngagement,
    };
  });

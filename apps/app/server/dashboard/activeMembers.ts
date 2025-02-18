import { prisma } from "@conquest/db/prisma";
import { eachDayOfInterval, format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const activeMembers = protectedProcedure
  .input(
    z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { from, to } = input;
    const { workspace_id } = user;

    const allDates = eachDayOfInterval({ start: from, end: to });

    const activeMembersByDay = await Promise.all(
      allDates.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        const activeMembers = await prisma.member.count({
          where: {
            workspace_id,
            activities: {
              some: {
                created_at: {
                  gte: date,
                  lt: nextDay,
                },
              },
            },
          },
        });

        return {
          date: format(date, "PP"),
          count: activeMembers,
        };
      }),
    );

    const membersData = Object.fromEntries(
      activeMembersByDay.map(({ date, count }) => [date, count]),
    );

    const totalActiveMembers = await prisma.member.count({
      where: {
        workspace_id,
        activities: {
          some: {
            created_at: {
              gte: from,
              lte: to,
            },
          },
        },
      },
    });

    return {
      activeMembers: totalActiveMembers,
      activeMembersData: membersData,
    };
  });

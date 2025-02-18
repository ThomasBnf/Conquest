import { prisma } from "@conquest/db/prisma";
import { eachDayOfInterval, format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const totalMembers = protectedProcedure
  .input(
    z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { from, to } = input;
    const { workspace_id } = user;

    const countMembers = await prisma.member.count({
      where: {
        created_at: {
          lt: from,
        },
        workspace_id,
      },
    });

    const members = await prisma.member.findMany({
      where: {
        created_at: {
          gte: from,
          lte: to,
        },
        workspace_id,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    const allDates = eachDayOfInterval({ start: from, end: to }).map((date) =>
      format(date, "PP"),
    );

    const membersData = allDates.reduce<Record<string, number>>((acc, date) => {
      const membersOnDate = members.filter(
        (member) => format(member.created_at, "PP") === date,
      ).length;

      const previousDate = allDates[allDates.indexOf(date) - 1];
      const previousTotal = previousDate ? acc[previousDate] : countMembers;

      acc[date] = (previousTotal ?? 0) + membersOnDate;
      return acc;
    }, {});

    return {
      totalMembers: countMembers + members.length,
      membersData,
    };
  });

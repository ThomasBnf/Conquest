import { prisma } from "@conquest/db/prisma";
import { eachDayOfInterval, format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const newMembers = protectedProcedure
  .input(
    z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { from, to } = input;
    const { workspace_id } = user;

    const members = await prisma.member.findMany({
      where: {
        workspace_id,
        created_at: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        created_at: "asc",
      },
    });

    const allDates = eachDayOfInterval({ start: from, end: to }).map((date) =>
      format(date, "PP"),
    );

    const membersData = members.reduce<Record<string, number>>(
      (acc, member) => {
        const date = format(member.created_at, "PP");
        const previousDates = Object.keys(acc);
        const lastDate = previousDates[previousDates.length - 1];
        const previousTotal = lastDate ? acc[lastDate] : 0;

        acc[date] = (acc[date] ?? previousTotal ?? 0) + 1;
        return acc;
      },
      Object.fromEntries(
        allDates.map((date) => {
          return [date, 0];
        }),
      ),
    );

    return {
      newMembers: members.length,
      newMembersData: membersData,
    };
  });

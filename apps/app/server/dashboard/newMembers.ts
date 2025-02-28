import { client } from "@conquest/clickhouse/client";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
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

    const resultCount = await client.query({
      query: `
        SELECT *
        FROM members
        WHERE workspace_id = '${workspace_id}'
        AND created_at >= '${from}'
        AND created_at <= '${to}'
      `,
    });

    const { data, rows } = await resultCount.json();
    const members = MemberSchema.array().parse(data);

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
      newMembers: rows,
      newMembersData: membersData,
    };
  });

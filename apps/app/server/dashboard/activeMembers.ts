import { client } from "@conquest/clickhouse/client";
import { differenceInDays, endOfDay, format, subDays } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const activeMembers = protectedProcedure
  .input(
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  )
  .query(async ({ input }) => {
    const { from, to } = input;

    const previousPeriodLength = differenceInDays(to, from);
    const previousFrom = subDays(from, previousPeriodLength);
    const previousTo = subDays(to, previousPeriodLength);

    const formattedFrom = format(from, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(endOfDay(to), "yyyy-MM-dd HH:mm:ss");
    const formattedPreviousFrom = format(previousFrom, "yyyy-MM-dd HH:mm:ss");
    const formattedPreviousTo = format(
      endOfDay(previousTo),
      "yyyy-MM-dd HH:mm:ss",
    );

    const result = await client.query({
      query: `
        WITH 
          (
            SELECT count(DISTINCT member_id)
            FROM activity
            WHERE created_at >= '${formattedFrom}' 
            AND created_at <= '${formattedTo}'
          ) as current_count,
          (
            SELECT count(DISTINCT member_id)
            FROM activity
            WHERE created_at >= '${formattedPreviousFrom}' 
            AND created_at <= '${formattedPreviousTo}'
          ) as previous_count
        SELECT 
          current_count as current,
          previous_count as previous,
          if(previous_count = 0, 0, ((current_count - previous_count) / previous_count) * 100) as variation
      `,
      format: "JSON",
    });

    const { data } = (await result.json()) as {
      data: Array<{ current: number; previous: number; variation: number }>;
    };

    return {
      current: data[0]?.current ?? 0,
      previous: data[0]?.previous ?? 0,
      variation: data[0]?.variation ?? 0,
    };
  });

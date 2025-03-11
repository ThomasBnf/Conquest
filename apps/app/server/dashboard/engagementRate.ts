import { client } from "@conquest/clickhouse/client";
import { differenceInDays, endOfDay, format, subDays } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const engagementRate = protectedProcedure
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
          total_members AS (
            SELECT 
              count() AS current_total FROM member WHERE created_at <= '${formattedTo}',
              count() AS previous_total FROM member WHERE created_at <= '${formattedPreviousTo}'
          ),
          active_members AS (
            SELECT 
              countDistinct(if(created_at BETWEEN '${formattedFrom}' AND '${formattedTo}', member_id, null)) AS current_active,
              countDistinct(if(created_at BETWEEN '${formattedPreviousFrom}' AND '${formattedPreviousTo}', member_id, null)) AS previous_active
            FROM activity
            WHERE created_at >= '${formattedPreviousFrom}' AND created_at <= '${formattedTo}'
          )
        SELECT 
          round(a.current_active * 100.0 / t.current_total, 2) AS current,
          round(a.previous_active * 100.0 / t.previous_total, 2) AS previous,
          if(round(a.previous_active * 100.0 / t.previous_total, 2) = 0, 0, 
             round(
               (a.current_active * 100.0 / t.current_total) - 
               (a.previous_active * 100.0 / t.previous_total), 
             2)
          ) AS variation
        FROM active_members a, total_members t
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

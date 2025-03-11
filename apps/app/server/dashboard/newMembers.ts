import { client } from "@conquest/clickhouse/client";
import { differenceInDays, endOfDay, format, subDays } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const newMembers = protectedProcedure
  .input(
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
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
            SELECT 
              countIf(created_at >= '${formattedFrom}' AND created_at <= '${formattedTo}') as current_count,
              countIf(created_at >= '${formattedPreviousFrom}' AND created_at <= '${formattedPreviousTo}') as previous_count
            FROM member
            WHERE workspace_id = '${workspace_id}'
          ) as counts
        SELECT 
          counts.current_count as current,
          counts.previous_count as previous,
          CASE
            WHEN counts.previous_count = 0 AND counts.current_count > 0 THEN 100
            WHEN counts.previous_count = 0 THEN 0
            ELSE ((counts.current_count - counts.previous_count) / counts.previous_count) * 100
          END as variation
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

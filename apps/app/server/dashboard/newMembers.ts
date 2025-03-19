import { client } from "@conquest/clickhouse/client";
import {
  addHours,
  differenceInDays,
  endOfDay,
  format,
  subDays,
} from "date-fns";
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

    const fromAdjusted = addHours(from, 1);
    const toAdjusted = addHours(to, 1);

    const previousPeriodLength = differenceInDays(toAdjusted, fromAdjusted);
    const previousFrom = subDays(fromAdjusted, previousPeriodLength);
    const previousTo = subDays(toAdjusted, previousPeriodLength);

    const formattedFrom = format(fromAdjusted, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(endOfDay(toAdjusted), "yyyy-MM-dd HH:mm:ss");
    const formattedPreviousFrom = format(previousFrom, "yyyy-MM-dd HH:mm:ss");
    const formattedPreviousTo = format(
      endOfDay(previousTo),
      "yyyy-MM-dd HH:mm:ss",
    );

    const result = await client.query({
      query: `
        WITH 
          (
            SELECT count()
            FROM member
            WHERE created_at >= '${formattedFrom}' 
            AND created_at <= '${formattedTo}'
            AND workspace_id = '${workspace_id}'
          ) as current_count,
          (
            SELECT count()
            FROM member
            WHERE created_at >= '${formattedPreviousFrom}' 
            AND created_at <= '${formattedPreviousTo}'
            AND workspace_id = '${workspace_id}'
          ) as previous_count
        SELECT 
          current_count as current,
          previous_count as previous,
          CASE
            WHEN previous_count = 0 AND current_count > 0 THEN 100
            WHEN previous_count = 0 THEN 0
            ELSE ((current_count - previous_count) / previous_count) * 100
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

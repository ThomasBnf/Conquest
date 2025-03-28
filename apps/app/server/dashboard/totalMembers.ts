import { client } from "@conquest/clickhouse/client";
import { differenceInDays, format, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const totalMembers = protectedProcedure
  .input(
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { from, to } = input;

    const timeZone = "Europe/Paris";
    const fromInParis = toZonedTime(from, timeZone);
    const toInParis = toZonedTime(to, timeZone);

    const _from = format(fromInParis, "yyyy-MM-dd HH:mm:ss");
    const _to = format(toInParis, "yyyy-MM-dd HH:mm:ss");

    const difference = differenceInDays(_to, _from);
    const previousFrom = subDays(_from, difference);
    const previousTo = subDays(_to, difference);

    const _previousFrom = format(previousFrom, "yyyy-MM-dd HH:mm:ss");
    const _previousTo = format(previousTo, "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        WITH 
          (
            SELECT 
              countIf(created_at <= '${_to}') as current_period_end,
              countIf(created_at <= '${_from}') as current_period_start,
              countIf(created_at <= '${_previousTo}') as previous_period_end,
              countIf(created_at <= '${_previousFrom}') as previous_period_start
            FROM member FINAL
            WHERE 
              workspace_id = '${workspace_id}'
          ) as count 
        SELECT 
          count.current_period_end as current,
          count.previous_period_end as previous,
          CASE
            WHEN count.previous_period_end = 0 AND count.current_period_end > 0 THEN 100
            WHEN count.previous_period_end = 0 THEN 0
            ELSE ((count.current_period_end - count.previous_period_end) / count.previous_period_end) * 100
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

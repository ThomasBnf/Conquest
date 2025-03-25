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

    console.log("fromInParis", fromInParis);
    console.log("toInParis", toInParis);

    const _from = format(fromInParis, "yyyy-MM-dd HH:mm:ss");
    const _to = format(toInParis, "yyyy-MM-dd HH:mm:ss");

    console.log("from", _from);
    console.log("to", _to);

    const difference = differenceInDays(_to, _from);
    const previousFrom = subDays(_from, difference);
    const previousTo = subDays(_to, difference);

    console.log("difference", difference);
    console.log("previousFrom", previousFrom);
    console.log("previousTo", previousTo);

    const _previousFrom = format(previousFrom, "yyyy-MM-dd HH:mm:ss");
    const _previousTo = format(previousTo, "yyyy-MM-dd HH:mm:ss");

    console.log("previousFrom", _previousFrom);
    console.log("previousTo", _previousTo);

    const result = await client.query({
      query: `
        WITH 
          (
            SELECT 
              countIf(created_at <= '${_to}') as current_period_end,
              countIf(created_at <= '${_from}') as current_period_start,
              countIf(created_at <= '${_previousTo}') as previous_period_end,
              countIf(created_at <= '${_previousFrom}') as previous_period_start
            FROM member
            WHERE workspace_id = '${workspace_id}'
          ) as counts 
        SELECT 
          counts.current_period_end as current,
          counts.previous_period_end as previous,
          CASE
            WHEN counts.previous_period_end = 0 AND counts.current_period_end > 0 THEN 100
            WHEN counts.previous_period_end = 0 THEN 0
            ELSE ((counts.current_period_end - counts.previous_period_end) / counts.previous_period_end) * 100
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

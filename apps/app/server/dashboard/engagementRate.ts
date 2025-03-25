import { client } from "@conquest/clickhouse/client";
import { addHours, differenceInDays, format, subDays } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";
import { toZonedTime } from "date-fns-tz";

export const engagementRate = protectedProcedure
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
              round(count(DISTINCT member_id) * 100.0 / 
              (SELECT count() FROM member WHERE created_at <= '${_to}'), 2)
            FROM activity
            WHERE created_at >= '${_from}' 
            AND created_at <= '${_to}'
            AND workspace_id = '${workspace_id}'
          ) as current_rate,
          (
            SELECT 
              round(count(DISTINCT member_id) * 100.0 / 
              (SELECT count() FROM member WHERE created_at <= '${_previousTo}'), 2)
            FROM activity
            WHERE created_at >= '${_previousFrom}' 
            AND created_at <= '${_previousTo}'
            AND workspace_id = '${workspace_id}'
          ) as previous_rate
        SELECT 
          current_rate as current,
          previous_rate as previous,
          if(previous_rate = 0, 0, round(current_rate - previous_rate, 2)) as variation
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

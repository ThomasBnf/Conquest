import { client } from "@conquest/clickhouse/client";
import { differenceInDays, format, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

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
              count(DISTINCT member_id) * 100.0 / 
              (SELECT count() 
                FROM member 
                WHERE 
                  deleted_at is NULL 
                  AND workspace_id = '${workspace_id}'
                  AND created_at <= '${_to}')
            FROM activity a
            JOIN member m ON a.member_id = m.id
            WHERE 
              a.created_at >= '${_from}' 
              AND a.created_at <= '${_to}'
              AND m.deleted_at is NULL
              AND a.workspace_id = '${workspace_id}'
          ) as current_rate,
          (
            SELECT 
              count(DISTINCT member_id) * 100.0 / 
              (SELECT count() 
                FROM member 
                WHERE 
                  deleted_at is NULL 
                  AND workspace_id = '${workspace_id}'
                  AND created_at <= '${_previousTo}')
            FROM activity a
            JOIN member m ON a.member_id = m.id
            WHERE 
              a.created_at >= '${_previousFrom}' 
              AND a.created_at <= '${_previousTo}'
              AND m.deleted_at is NULL
              AND a.workspace_id = '${workspace_id}'
          ) as previous_rate
        SELECT 
          current_rate as current,
          previous_rate as previous,
          if(previous_rate = 0, 0, current_rate - previous_rate) as variation
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

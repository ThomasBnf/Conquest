import { client } from "@conquest/clickhouse/client";
import { differenceInDays, format, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const atRiskMembers = protectedProcedure
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
        SELECT 
          currentCount.count as current,
          previousCount.count as previous,
          ((currentCount.count - previousCount.count) / nullIf(previousCount.count, 0)) * 100 as variation_rate
        FROM
        (
          SELECT count(*) as count
          FROM member m
          LEFT JOIN level l ON m.level_id = l.id
          WHERE 
            AND m.workspace_id = '${workspace_id}'
            AND l.number >= 4
            AND m.id NOT IN (
              SELECT member_id 
              FROM activity 
              WHERE 
                workspace_id = '${workspace_id}'
                AND created_at BETWEEN '${_from}' AND '${_to}'
            )
        ) as currentCount,
        (
          SELECT count(*) as count
          FROM member m
          LEFT JOIN level l ON m.level_id = l.id
          WHERE 
            m.workspace_id = '${workspace_id}'
            AND l.number >= 4
            AND m.id NOT IN (
              SELECT member_id 
              FROM activity 
              WHERE workspace_id = '${workspace_id}'
                AND created_at BETWEEN '${_previousFrom}' AND '${_previousTo}'
            )
        ) as previousCount
      `,
      format: "JSON",
    });

    const { data } = (await result.json()) as {
      data: Array<{
        current: number;
        previous: number;
        variation_rate: number;
      }>;
    };

    return {
      current: data[0]?.current ?? 0,
      previous: data[0]?.previous ?? 0,
      variation: data[0]?.variation_rate ?? 0,
    };
  });

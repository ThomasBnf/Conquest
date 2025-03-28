import { client } from "@conquest/clickhouse/client";
import { differenceInDays, format, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const churnRate = protectedProcedure
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
          (currentInactive.count / nullIf(currentTotal.total, 0)) * 100 as current,
          (previousInactive.count / nullIf(previousTotal.total, 0)) * 100 as previous,
          (((currentInactive.count / nullIf(currentTotal.total, 0)) - 
            (previousInactive.count / nullIf(previousTotal.total, 0))) * 100) as variation_rate
        FROM
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
              WHERE 
                workspace_id = '${workspace_id}'
                AND created_at BETWEEN '${_from}' AND '${_to}'
            )
        ) as currentInactive,
        (
          SELECT count(*) as total
          FROM member m
          LEFT JOIN level l ON m.level_id = l.id
          WHERE 
            m.workspace_id = '${workspace_id}'
            AND l.number >= 4
        ) as currentTotal,
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
              WHERE 
                workspace_id = '${workspace_id}'
                AND created_at BETWEEN '${_previousFrom}' AND '${_previousTo}'
            )
        ) as previousInactive,
        (
          SELECT count(*) as total
          FROM member m
          LEFT JOIN level l ON m.level_id = l.id
          WHERE 
            m.workspace_id = '${workspace_id}'
            AND l.number >= 4
        ) as previousTotal
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

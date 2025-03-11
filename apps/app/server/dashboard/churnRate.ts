import { client } from "@conquest/clickhouse/client";
import { format } from "date-fns";
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

    const previousPeriodLength = Math.abs(to.getTime() - from.getTime());
    const previousFrom = new Date(from.getTime() - previousPeriodLength);
    const previousTo = new Date(to.getTime() - previousPeriodLength);

    const formattedFrom = format(from, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(to, "yyyy-MM-dd HH:mm:ss");
    const formattedPreviousFrom = format(previousFrom, "yyyy-MM-dd HH:mm:ss");
    const formattedPreviousTo = format(previousTo, "yyyy-MM-dd HH:mm:ss");

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
            AND l.number >= 3
            AND m.id NOT IN (
              SELECT member_id 
              FROM activity 
              WHERE workspace_id = '${workspace_id}'
                AND created_at BETWEEN '${formattedFrom}' AND '${formattedTo}'
            )
        ) as currentInactive,
        (
          SELECT count(*) as total
          FROM member m
          LEFT JOIN level l ON m.level_id = l.id
          WHERE 
            m.workspace_id = '${workspace_id}'
            AND l.number >= 3
        ) as currentTotal,
        (
          SELECT count(*) as count
          FROM member m
          LEFT JOIN level l ON m.level_id = l.id
          WHERE 
            m.workspace_id = '${workspace_id}'
            AND l.number >= 3
            AND m.id NOT IN (
              SELECT member_id 
              FROM activity 
              WHERE workspace_id = '${workspace_id}'
                AND created_at BETWEEN '${formattedPreviousFrom}' AND '${formattedPreviousTo}'
            )
        ) as previousInactive,
        (
          SELECT count(*) as total
          FROM member m
          LEFT JOIN level l ON m.level_id = l.id
          WHERE 
            m.workspace_id = '${workspace_id}'
            AND l.number >= 3
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

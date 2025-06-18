import { client } from "@conquest/clickhouse/client";
import { differenceInDays, format, subDays } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../../../server/trpc";

export const atRiskMembers = protectedProcedure
  .input(
    z.object({
      dateRange: z
        .object({
          from: z.coerce.date().optional(),
          to: z.coerce.date().optional(),
        })
        .optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { dateRange } = input;
    const { from, to } = dateRange ?? {};

    if (!from || !to) {
      return {
        current: 0,
        previous: 0,
        variation: 0,
      };
    }

    const formattedFrom = format(from, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(to, "yyyy-MM-dd HH:mm:ss");
    const days = differenceInDays(to, from);

    const previousFrom = format(subDays(from, days), "yyyy-MM-dd HH:mm:ss");
    const previousTo = format(subDays(from, 1), "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        SELECT 
          currentCount.count as current,
          previousCount.count as previous,
          ((currentCount.count - previousCount.count) / nullIf(previousCount.count, 0)) * 100 as variation_rate
        FROM
        (
          SELECT count(*) as count
          FROM member m FINAL
          WHERE 
            m.workspaceId = '${workspaceId}'
            AND m.isStaff = 0
            AND m.pulse >= 20
            AND m.id NOT IN (
              SELECT memberId 
              FROM activity 
              WHERE 
                workspaceId = '${workspaceId}'
                AND createdAt BETWEEN '${formattedFrom}' AND '${formattedTo}'
            )
        ) as currentCount,
        (
          SELECT count(*) as count
          FROM member m FINAL
          WHERE 
            m.workspaceId = '${workspaceId}'
            AND m.isStaff = 0
            AND m.pulse >= 20
            AND m.id NOT IN (
              SELECT memberId 
              FROM activity 
              WHERE workspaceId = '${workspaceId}'
                AND createdAt BETWEEN '${previousFrom}' AND '${previousTo}'
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

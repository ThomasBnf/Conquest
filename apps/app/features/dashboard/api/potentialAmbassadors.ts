import { client } from "@conquest/clickhouse/client";
import { differenceInDays, format, subDays } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../../../server/trpc";

export const potentialAmbassadors = protectedProcedure
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
        WITH 
          (
            SELECT count(DISTINCT m.id)
            FROM member m FINAL
            WHERE 
              m.workspaceId = '${workspaceId}'
              AND m.isStaff = 0
              AND m.pulse >= 150
              AND m.pulse <= 199
              AND m.id IN (
                SELECT memberId 
                FROM activity 
                WHERE
                  workspaceId = '${workspaceId}'
                  AND createdAt BETWEEN '${formattedFrom}' AND '${formattedTo}'
              )
          ) as currentCount,
          (
            SELECT count(DISTINCT m.id)
            FROM member m FINAL
            WHERE 
              m.workspaceId = '${workspaceId}'
              AND m.isStaff = 0
              AND m.pulse >= 150
              AND m.pulse <= 199
              AND m.id IN (
                SELECT memberId 
                FROM activity 
                WHERE
                  workspaceId = '${workspaceId}'
                  AND createdAt BETWEEN '${previousFrom}' AND '${previousTo}'
              )
          ) as previousCount
        SELECT 
          currentCount as current,
          previousCount as previous,
          CASE
            WHEN previousCount = 0 AND currentCount > 0 THEN 100
            WHEN previousCount = 0 THEN 0
            ELSE ((currentCount - previousCount) / previousCount) * 100
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

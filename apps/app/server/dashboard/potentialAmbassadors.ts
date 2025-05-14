import { client } from "@conquest/clickhouse/client";
import { differenceInDays, format, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const potentialAmbassadors = protectedProcedure
  .input(
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
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
            SELECT count(DISTINCT m.id)
            FROM member m FINAL
            LEFT JOIN level l ON m.levelId = l.id
            WHERE 
              m.workspaceId = '${workspaceId}'
              AND m.isStaff = 0
              AND l.number >= 7
              AND l.number <= 9
              AND m.id IN (
                SELECT memberId 
                FROM activity 
                WHERE
                  workspaceId = '${workspaceId}'
                  AND createdAt BETWEEN '${_from}' AND '${_to}'
              )
          ) as currentCount,
          (
            SELECT count(DISTINCT m.id)
            FROM member m FINAL
            LEFT JOIN level l ON m.levelId = l.id
            WHERE 
              m.workspaceId = '${workspaceId}'
              AND m.isStaff = 0
              AND l.number >= 7
              AND l.number <= 9
              AND m.id IN (
                SELECT memberId 
                FROM activity 
                WHERE
                  workspaceId = '${workspaceId}'
                  AND createdAt BETWEEN '${_previousFrom}' AND '${_previousTo}'
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

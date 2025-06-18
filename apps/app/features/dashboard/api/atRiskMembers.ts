import { client } from "@conquest/clickhouse/client";
import { differenceInDays, format, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
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
                AND createdAt BETWEEN '${_from}' AND '${_to}'
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
                AND createdAt BETWEEN '${_previousFrom}' AND '${_previousTo}'
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

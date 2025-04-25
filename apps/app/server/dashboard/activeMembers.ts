import { client } from "@conquest/clickhouse/client";
import { differenceInDays, format, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const activeMembers = protectedProcedure
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
            SELECT count(DISTINCT a.memberId)
            FROM activity a
            JOIN member m FINAL ON a.memberId = m.id
            WHERE 
              a.createdAt >= '${_from}' 
              AND a.createdAt <= '${_to}'
              AND m.workspaceId = '${workspaceId}'
          ) as currentCount,
          (
            SELECT count(DISTINCT a.memberId)
            FROM activity a
            JOIN member m FINAL ON a.memberId = m.id
            WHERE 
              a.createdAt >= '${_previousFrom}' 
              AND a.createdAt <= '${_previousTo}'
              AND m.workspaceId = '${workspaceId}'
          ) as previousCount
        SELECT 
          currentCount as current,
          previousCount as previous,
          if(previousCount = 0, 0, ((currentCount - previousCount) / previousCount) * 100) as variation
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

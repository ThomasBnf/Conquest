import { client } from "@conquest/clickhouse/client";
import { differenceInDays, format, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const totalMembers = protectedProcedure
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
            SELECT 
              countIf(createdAt <= '${_to}') as currentPeriodEnd,
              countIf(createdAt <= '${_from}') as currentPeriodStart,
              countIf(createdAt <= '${_previousTo}') as previousPeriodEnd,
              countIf(createdAt <= '${_previousFrom}') as previousPeriodStart
            FROM member FINAL
            WHERE 
              workspaceId = '${workspaceId}'
          ) as count 
        SELECT 
          count.currentPeriodEnd as current,
          count.previousPeriodEnd as previous,
          CASE
            WHEN count.previousPeriodEnd = 0 AND count.currentPeriodEnd > 0 THEN 100
            WHEN count.previousPeriodEnd = 0 THEN 0
            ELSE ((count.currentPeriodEnd - count.previousPeriodEnd) / count.previousPeriodEnd) * 100
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

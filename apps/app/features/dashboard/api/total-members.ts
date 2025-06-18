import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { SOURCE, Source } from "@conquest/zod/enum/source.enum";
import { differenceInDays, format, subDays } from "date-fns";
import z from "zod";
import { getUniquePeriods } from "../helpers/getUniquePeriods";

export const totalMembers = protectedProcedure
  .input(
    z.object({
      dateRange: z
        .object({
          from: z.coerce.date().optional(),
          to: z.coerce.date().optional(),
        })
        .optional(),
      sources: z.array(SOURCE),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { dateRange, sources } = input;
    const { from, to } = dateRange ?? {};

    if (!from || !to) {
      return {
        total: 0,
        growthRate: 0,
        profiles: [],
      };
    }

    const formattedTo = format(to, "yyyy-MM-dd HH:mm:ss");
    const days = differenceInDays(to, from);
    const isWeekly = days > 30;

    const previousTo = format(subDays(to, days), "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        WITH period_data AS (
          SELECT 
            ${isWeekly ? "toStartOfWeek(createdAt)" : "toDate(createdAt)"} as week,
            attributes.source as source,
            count() as count
          FROM profile FINAL
          WHERE workspaceId = '${workspaceId}'
            AND createdAt <= '${formattedTo}'
            AND attributes.source IN (${sources.map((s) => `'${s}'`).join(",")})
          GROUP BY week, source
        ),
        current_total AS (
          SELECT count() as total
          FROM member FINAL
          WHERE workspaceId = '${workspaceId}'
            AND createdAt <= '${formattedTo}'
        ),
        previous_total AS (
          SELECT count() as total
          FROM member FINAL
          WHERE workspaceId = '${workspaceId}'
            AND createdAt <= '${previousTo}'
        )
        SELECT 
          period_data.*,
          (SELECT total FROM current_total) AS currentTotal,
          (SELECT total FROM previous_total) AS previousTotal
        FROM period_data
      `,
    });

    const { data } = await result.json<{
      week: string;
      source: string;
      count: number;
      currentTotal: number;
      previousTotal: number;
    }>();

    const periods = getUniquePeriods(from, to);

    const currentTotal = Number(data[0]?.currentTotal) || 0;
    const previousTotal = Number(data[0]?.previousTotal) || 0;
    const growthRate =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    const profiles: Array<{ week: string } & Record<Source, number>> = [];
    const cumulativeTotals = {} as Record<Source, number>;

    for (const source of sources) {
      cumulativeTotals[source] = 0;
    }

    for (const period of periods) {
      const periodData: { week: string } & Record<Source, number> = {
        week: period,
      } as { week: string } & Record<Source, number>;

      for (const source of sources) {
        const sourceData = data.find(
          (d) => d.week === period && d.source === source,
        );
        const count = Number(sourceData?.count) || 0;
        cumulativeTotals[source] += count;
        periodData[source] = cumulativeTotals[source];
      }

      profiles.push(periodData);
    }

    return {
      total: currentTotal,
      growthRate,
      profiles,
    };
  });

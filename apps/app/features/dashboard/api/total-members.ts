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

    const formattedFrom = format(from, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(to, "yyyy-MM-dd HH:mm:ss");
    const days = differenceInDays(to, from);
    const isWeekly = days > 30;

    const previousTo = format(subDays(from, 1), "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        WITH period_data AS (
          SELECT 
            ${isWeekly ? "toStartOfWeek(createdAt)" : "toDate(createdAt)"} as week,
            attributes.source as source,
            count() as count
          FROM profile FINAL
          WHERE workspaceId = '${workspaceId}'
            AND createdAt >= '${formattedFrom}'
            AND createdAt <= '${formattedTo}'
            AND attributes.source IN (${sources.map((s) => `'${s}'`).join(",")})
          GROUP BY week, source
        ),
        initial_totals AS (
          SELECT 
            attributes.source as source,
            count() as initialCount
          FROM profile FINAL
          WHERE workspaceId = '${workspaceId}'
            AND createdAt < '${formattedFrom}'
            AND attributes.source IN (${sources.map((s) => `'${s}'`).join(",")})
          GROUP BY source
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
          (SELECT total FROM previous_total) AS previousTotal,
          COALESCE(initial_totals.initialCount, 0) as initialCount
        FROM period_data
        LEFT JOIN initial_totals ON period_data.source = initial_totals.source
      `,
    });

    const { data } = await result.json<{
      week: string;
      source: string;
      count: number;
      currentTotal: number;
      previousTotal: number;
      initialCount: number;
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
      const sourceData = data.find((d) => d.source === source);
      cumulativeTotals[source] = Number(sourceData?.initialCount) || 0;
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

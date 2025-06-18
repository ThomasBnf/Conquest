import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { SOURCE, Source } from "@conquest/zod/enum/source.enum";
import { differenceInDays, format, subDays } from "date-fns";
import z from "zod";
import { getUniquePeriods } from "../helpers/getUniquePeriods";

export const engagementRate = protectedProcedure
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
        overallRate: 0,
        periodRate: [],
        growthRate: 0,
      };
    }

    const formattedFrom = format(from, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(to, "yyyy-MM-dd HH:mm:ss");
    const days = differenceInDays(to, from);
    const isWeekly = days > 30;

    const previousTo = format(subDays(to, days), "yyyy-MM-dd HH:mm:ss");
    const previousFrom = format(subDays(from, days), "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        WITH current_period AS (
          SELECT
            ${isWeekly ? "toStartOfWeek(a.createdAt)" : "toDate(a.createdAt)"} AS week,
            p.attributes.source AS source,
            count(DISTINCT a.memberId) AS activeMembers
          FROM activity a
          LEFT JOIN profile p FINAL ON p.memberId = a.memberId AND p.workspaceId = a.workspaceId
          WHERE a.workspaceId = '${workspaceId}'
            AND a.createdAt >= '${formattedFrom}'
            AND a.createdAt <= '${formattedTo}'
            AND (p.attributes.source IN (${sources.map((source) => `'${source}'`).join(", ")}) OR p.attributes.source IS NULL)
          GROUP BY week, p.attributes.source
        ),
        current_total AS (
          SELECT COUNT(DISTINCT memberId) AS total
          FROM activity
          WHERE workspaceId = '${workspaceId}'
            AND createdAt <= '${formattedTo}'
        ),
        current_active_total AS (
          SELECT count(DISTINCT a.memberId) AS activeMembers
          FROM activity a
          LEFT JOIN profile p FINAL ON p.memberId = a.memberId AND p.workspaceId = a.workspaceId
          WHERE a.workspaceId = '${workspaceId}'
            AND a.createdAt >= '${formattedFrom}'
            AND a.createdAt <= '${formattedTo}'
            AND (p.attributes.source IN (${sources.map((source) => `'${source}'`).join(", ")}) OR p.attributes.source IS NULL)
        ),
        previous_total AS (
          SELECT COUNT(DISTINCT memberId) AS total
          FROM activity
          WHERE workspaceId = '${workspaceId}'
            AND createdAt <= '${previousTo}'
        ),
        previous_active_total AS (
          SELECT count(DISTINCT a.memberId) AS activeMembers
          FROM activity a
          LEFT JOIN profile p FINAL ON p.memberId = a.memberId AND p.workspaceId = a.workspaceId
          WHERE a.workspaceId = '${workspaceId}'
            AND a.createdAt >= '${previousFrom}'
            AND a.createdAt <= '${previousTo}'
            AND (p.attributes.source IN (${sources.map((source) => `'${source}'`).join(", ")}) OR p.attributes.source IS NULL)
        )
        SELECT 
          current_period.*,
          (SELECT total FROM current_total) AS currentTotal,
          (SELECT activeMembers FROM current_active_total) AS currentActiveTotal,
          (SELECT total FROM previous_total) AS previousTotal,
          (SELECT activeMembers FROM previous_active_total) AS previousActiveTotal
        FROM current_period
        ORDER BY week ASC
      `,
    });

    const { data } = await result.json<{
      week: string;
      source: string | null;
      activeMembers: number;
      currentTotal: number;
      currentActiveTotal: number;
      previousTotal: number;
      previousActiveTotal: number;
    }>();

    const periods = getUniquePeriods(from, to);

    const currentTotal = Number(data[0]?.currentTotal) || 0;
    const currentActiveTotal = Number(data[0]?.currentActiveTotal) || 0;
    const previousTotal = Number(data[0]?.previousTotal) || 0;
    const previousActiveTotal = Number(data[0]?.previousActiveTotal) || 0;

    const overallRate =
      currentTotal > 0
        ? Math.round((currentActiveTotal / currentTotal) * 100 * 100) / 100
        : 0;
    const previousOverallRate =
      previousTotal > 0
        ? Math.round((previousActiveTotal / previousTotal) * 100 * 100) / 100
        : 0;
    const growthRate =
      previousOverallRate > 0
        ? Math.round(
            ((overallRate - previousOverallRate) / previousOverallRate) *
              100 *
              100,
          ) / 100
        : 0;

    const periodRate: Array<{ week: string } & Record<Source, number>> = [];

    for (const period of periods) {
      const periodData = data.filter((d) => d.week === period);
      const periodRateData: { week: string } & Record<Source, number> = {
        week: period,
      } as { week: string } & Record<Source, number>;

      for (const source of sources) {
        const sourceData = periodData.find((d) => d.source === source);
        const activeMembers = Number(sourceData?.activeMembers) || 0;
        const rate =
          currentTotal > 0
            ? Math.round((activeMembers / currentTotal) * 100 * 100) / 100
            : 0;
        periodRateData[source] = rate;
      }

      periodRate.push(periodRateData);
    }

    return {
      overallRate,
      periodRate,
      growthRate,
    };
  });

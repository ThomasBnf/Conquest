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
        growthRate: 0,
        week: [],
        engagementByIntegration: {},
      };
    }

    const formattedFrom = format(from, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(to, "yyyy-MM-dd HH:mm:ss");
    const days = differenceInDays(to, from);
    const isWeekly = days > 30;

    const previousFrom = format(subDays(from, days), "yyyy-MM-dd HH:mm:ss");
    const previousTo = format(subDays(from, 1), "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        WITH current_period AS (
          SELECT
            ${isWeekly ? "toStartOfWeek(a.createdAt)" : "toDate(a.createdAt)"} AS week,
            JSONExtractString(toString(p.attributes), 'source') AS source,
            count(DISTINCT a.memberId) AS activeMembers
          FROM activity a
          LEFT JOIN profile p FINAL ON p.memberId = a.memberId AND p.workspaceId = a.workspaceId
          WHERE a.workspaceId = '${workspaceId}'
            AND a.createdAt >= '${formattedFrom}'
            AND a.createdAt <= '${formattedTo}'
            AND (JSONExtractString(toString(p.attributes), 'source') IN (${sources.map((source) => `'${source}'`).join(", ")}) OR JSONExtractString(toString(p.attributes), 'source') IS NULL)
          GROUP BY week, JSONExtractString(toString(p.attributes), 'source')
        ),
        total_members AS (
          SELECT COUNT(DISTINCT m.id) AS total
          FROM member m
          LEFT JOIN profile p FINAL ON p.memberId = m.id AND p.workspaceId = m.workspaceId
          WHERE m.workspaceId = '${workspaceId}'
            AND m.createdAt <= '${formattedTo}'
            AND (JSONExtractString(toString(p.attributes), 'source') IN (${sources.map((source) => `'${source}'`).join(", ")}) OR JSONExtractString(toString(p.attributes), 'source') IS NULL)
        ),
        total_members_by_source AS (
          SELECT 
            JSONExtractString(toString(p.attributes), 'source') AS source,
            COUNT(DISTINCT m.id) AS total
          FROM member m
          LEFT JOIN profile p FINAL ON p.memberId = m.id AND p.workspaceId = m.workspaceId
          WHERE m.workspaceId = '${workspaceId}'
            AND m.createdAt <= '${formattedTo}'
            AND (JSONExtractString(toString(p.attributes), 'source') IN (${sources.map((source) => `'${source}'`).join(", ")}) OR JSONExtractString(toString(p.attributes), 'source') IS NULL)
          GROUP BY JSONExtractString(toString(p.attributes), 'source')
        ),
        active_members_by_source AS (
          SELECT 
            JSONExtractString(toString(p.attributes), 'source') AS source,
            count(DISTINCT a.memberId) AS activeMembers
          FROM activity a
          LEFT JOIN profile p FINAL ON p.memberId = a.memberId AND p.workspaceId = a.workspaceId
          WHERE a.workspaceId = '${workspaceId}'
            AND a.createdAt >= '${formattedFrom}'
            AND a.createdAt <= '${formattedTo}'
            AND (JSONExtractString(toString(p.attributes), 'source') IN (${sources.map((source) => `'${source}'`).join(", ")}) OR JSONExtractString(toString(p.attributes), 'source') IS NULL)
          GROUP BY JSONExtractString(toString(p.attributes), 'source')
        ),
        current_active_total AS (
          SELECT count(DISTINCT a.memberId) AS activeMembers
          FROM activity a
          LEFT JOIN profile p FINAL ON p.memberId = a.memberId AND p.workspaceId = a.workspaceId
          WHERE a.workspaceId = '${workspaceId}'
            AND a.createdAt >= '${formattedFrom}'
            AND a.createdAt <= '${formattedTo}'
            AND (JSONExtractString(toString(p.attributes), 'source') IN (${sources.map((source) => `'${source}'`).join(", ")}) OR JSONExtractString(toString(p.attributes), 'source') IS NULL)
        ),
        previous_total AS (
          SELECT COUNT(DISTINCT m.id) AS total
          FROM member m
          LEFT JOIN profile p FINAL ON p.memberId = m.id AND p.workspaceId = m.workspaceId
          WHERE m.workspaceId = '${workspaceId}'
            AND m.createdAt <= '${previousTo}'
            AND (JSONExtractString(toString(p.attributes), 'source') IN (${sources.map((source) => `'${source}'`).join(", ")}) OR JSONExtractString(toString(p.attributes), 'source') IS NULL)
        ),
        previous_active_total AS (
          SELECT count(DISTINCT a.memberId) AS activeMembers
          FROM activity a
          LEFT JOIN profile p FINAL ON p.memberId = a.memberId AND p.workspaceId = a.workspaceId
          WHERE a.workspaceId = '${workspaceId}'
            AND a.createdAt >= '${previousFrom}'
            AND a.createdAt <= '${previousTo}'
            AND (JSONExtractString(toString(p.attributes), 'source') IN (${sources.map((source) => `'${source}'`).join(", ")}) OR JSONExtractString(toString(p.attributes), 'source') IS NULL)
        )
        SELECT 
          current_period.*,
          (SELECT total FROM total_members) AS currentTotal,
          (SELECT activeMembers FROM current_active_total) AS currentActiveTotal,
          (SELECT total FROM previous_total) AS previousTotal,
          (SELECT activeMembers FROM previous_active_total) AS previousActiveTotal
        FROM current_period
        ORDER BY week ASC
      `,
    });

    const sourceStatsResult = await client.query({
      query: `
        SELECT 
          tmbs.source,
          tmbs.total AS totalMembers,
          COALESCE(ambs.activeMembers, 0) AS activeMembers
        FROM (
          SELECT 
            JSONExtractString(toString(p.attributes), 'source') AS source,
            COUNT(DISTINCT m.id) AS total
          FROM member m
          LEFT JOIN profile p FINAL ON p.memberId = m.id AND p.workspaceId = m.workspaceId
          WHERE m.workspaceId = '${workspaceId}'
            AND m.createdAt <= '${formattedTo}'
            AND (JSONExtractString(toString(p.attributes), 'source') IN (${sources.map((source) => `'${source}'`).join(", ")}) OR JSONExtractString(toString(p.attributes), 'source') IS NULL)
          GROUP BY JSONExtractString(toString(p.attributes), 'source')
        ) tmbs
        LEFT JOIN (
          SELECT 
            JSONExtractString(toString(p.attributes), 'source') AS source,
            count(DISTINCT a.memberId) AS activeMembers
          FROM activity a
          LEFT JOIN profile p FINAL ON p.memberId = a.memberId AND p.workspaceId = a.workspaceId
          WHERE a.workspaceId = '${workspaceId}'
            AND a.createdAt >= '${formattedFrom}'
            AND a.createdAt <= '${formattedTo}'
            AND (JSONExtractString(toString(p.attributes), 'source') IN (${sources.map((source) => `'${source}'`).join(", ")}) OR JSONExtractString(toString(p.attributes), 'source') IS NULL)
          GROUP BY JSONExtractString(toString(p.attributes), 'source')
        ) ambs ON tmbs.source = ambs.source
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

    const { data: sourceStats } = await sourceStatsResult.json<{
      source: string | null;
      totalMembers: number;
      activeMembers: number;
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

    const week: Array<{ week: string } & Record<Source, number>> = [];

    const sourceTotalsMap = new Map<string | null, number>();
    for (const stat of sourceStats) {
      sourceTotalsMap.set(stat.source, Number(stat.totalMembers) || 0);
    }

    for (const period of periods) {
      const periodData = data.filter((d) => d.week === period);

      const periodRates: { week: string } & Record<Source, number> = {
        week: period,
      } as { week: string } & Record<Source, number>;

      for (const source of sources) {
        const sourceData = periodData.find((d) => d.source === source);
        const activeMembers = Number(sourceData?.activeMembers) || 0;
        const sourceTotal = sourceTotalsMap.get(source) || 0;

        const rate =
          sourceTotal > 0
            ? Math.round((activeMembers / sourceTotal) * 100 * 100) / 100
            : 0;
        periodRates[source] = rate;
      }

      week.push(periodRates);
    }

    const engagementByIntegration: Record<Source, number> = {} as Record<
      Source,
      number
    >;

    for (const stat of sourceStats) {
      if (stat.source && sources.includes(stat.source as Source)) {
        const totalMembers = Number(stat.totalMembers) || 0;
        const activeMembers = Number(stat.activeMembers) || 0;
        const rate =
          totalMembers > 0
            ? Math.round((activeMembers / totalMembers) * 100 * 100) / 100
            : 0;

        engagementByIntegration[stat.source as Source] = rate;
      }
    }

    for (const source of sources) {
      if (engagementByIntegration[source] === undefined) {
        engagementByIntegration[source] = 0;
      }
    }

    return {
      overallRate,
      growthRate,
      week,
      engagementByIntegration,
    };
  });

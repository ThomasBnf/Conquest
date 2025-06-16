import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import {
  addDays,
  addWeeks,
  differenceInDays,
  format,
  startOfWeek,
} from "date-fns";
import z from "zod";

export const engagementRate = protectedProcedure
  .input(
    z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
      sources: z.array(SOURCE),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { from, to, sources } = input;

    const formattedFrom = format(from, "yyyy-MM-dd");
    const formattedTo = format(to, "yyyy-MM-dd");
    const days = differenceInDays(to, from);

    const periodEngagementResult = await client.query({
      query: `
        WITH 
        membersByPeriod AS (
          SELECT 
            ${days > 30 ? "toStartOfWeek(p.createdAt)" : "toDate(p.createdAt)"} AS period,
            p.memberId,
            p.attributes.source AS source
          FROM profile p FINAL
          WHERE p.workspaceId = '${workspaceId}'
            AND p.attributes.source IN (${sources.map((source) => `'${source}'`).join(",")})
            AND p.createdAt <= '${formattedTo}'
        ),
        engagementsByPeriod AS (
          SELECT
            ${days > 30 ? "toStartOfWeek(e.createdAt)" : "toDate(e.createdAt)"} AS period,
            e.memberId,
            COUNT(*) as engagements
          WHERE e.createdAt >= '${formattedFrom}'
            AND e.createdAt <= '${formattedTo}'
            AND e.workspaceId = '${workspaceId}'
          GROUP BY period, e.memberId
        )
        SELECT 
          ep.period,
          mp.source,
          COUNT(DISTINCT mp.memberId) as totalMembers,
          COUNT(DISTINCT ep.memberId) as engagedMembers,
          ROUND(COUNT(DISTINCT ep.memberId) * 100.0 / COUNT(DISTINCT mp.memberId), 2) as engagementRate
        FROM membersByPeriod mp
        CROSS JOIN engagementsByPeriod ep
        WHERE mp.period <= ep.period
          AND mp.memberId = ep.memberId
        GROUP BY ep.period, mp.source
        ORDER BY ep.period, mp.source
      `,
    });

    // Query pour l'overall engagement rate
    const overallEngagementResult = await client.query({
      query: `
        WITH 
        allMembers AS (
          SELECT DISTINCT memberId
          FROM profile FINAL
          WHERE workspaceId = '${workspaceId}'
            AND attributes.source IN (${sources.map((source) => `'${source}'`).join(",")})
        ),
        engagedMembers AS (
          SELECT DISTINCT memberId
          WHERE createdAt >= '${formattedFrom}'
            AND createdAt <= '${formattedTo}'
            AND workspaceId = '${workspaceId}'
            AND memberId IN (SELECT memberId FROM allMembers)
        )
        SELECT 
          COUNT(DISTINCT em.memberId) as engagedCount,
          COUNT(DISTINCT am.memberId) as totalCount,
          ROUND(COUNT(DISTINCT em.memberId) * 100.0 / COUNT(DISTINCT am.memberId), 2) as overallEngagementRate
        FROM allMembers am
        LEFT JOIN engagedMembers em ON am.memberId = em.memberId
      `,
    });

    const { data: periodData } = await periodEngagementResult.json();
    const { data: overallData } = (await overallEngagementResult.json()) as {
      data: {
        engagedCount: number;
        totalCount: number;
        overallEngagementRate: number;
      }[];
    };

    type PeriodEngagementData = {
      period: string;
      source: string;
      totalMembers: number;
      engagedMembers: number;
      engagementRate: number;
    };

    type ResultData = {
      week: string;
      [key: string]: number | string;
    };

    const periodEngagements = periodData as PeriodEngagementData[];

    // Générer les périodes
    const periods: string[] = [];
    let current = new Date(from);
    const end = new Date(to);

    while (current <= end) {
      if (days > 30) {
        const weekStart = startOfWeek(current);
        periods.push(format(weekStart, "yyyy-MM-dd"));
        current = addWeeks(current, 1);
      } else {
        periods.push(format(current, "yyyy-MM-dd"));
        current = addDays(current, 1);
      }
    }

    // Mapper les données d'engagement par période
    const engagementByPeriod = new Map<string, Map<string, number>>();

    for (const engagement of periodEngagements) {
      if (!engagementByPeriod.has(engagement.period)) {
        engagementByPeriod.set(engagement.period, new Map());
      }
      engagementByPeriod
        .get(engagement.period)!
        .set(engagement.source, engagement.engagementRate);
    }

    // Construire le résultat final
    const engagementRateData: ResultData[] = periods.map((period) => {
      const result: ResultData = { week: period };

      for (const source of sources) {
        result[source] = engagementByPeriod.get(period)?.get(source) || 0;
      }

      return result;
    });

    return {
      periodEngagementRates: engagementRateData,
      overallEngagementRate: overallData?.[0]?.overallEngagementRate || 0,
    };
  });

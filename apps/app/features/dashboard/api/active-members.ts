import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { SOURCE, Source } from "@conquest/zod/enum/source.enum";
import { differenceInDays, format, subDays } from "date-fns";
import z from "zod";
import { getUniquePeriods } from "../helpers/getUniquePeriods";

export const activeMembers = protectedProcedure
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
        profiles: [],
        total: 0,
        growthRate: 0,
      };
    }

    const formattedFrom = format(from, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(to, "yyyy-MM-dd HH:mm:ss");
    const days = differenceInDays(to, from);
    const isWeekly = days > 30;

    const previousFrom = format(subDays(from, days), "yyyy-MM-dd HH:mm:ss");
    const previousTo = format(subDays(to, days), "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        WITH period_data AS (
          SELECT
            ${isWeekly ? "toStartOfWeek(a.createdAt)" : "toDate(a.createdAt)"} AS week,
            p.attributes.source AS source,
            groupArray(DISTINCT a.memberId) AS memberIds
          FROM activity a
          JOIN profile p FINAL ON p.memberId = a.memberId AND p.workspaceId = a.workspaceId
          WHERE a.createdAt >= '${formattedFrom}'
            AND a.createdAt <= '${formattedTo}'
            AND a.workspaceId = '${workspaceId}'
            AND p.attributes.source IN (${sources.map((source) => `'${source}'`).join(", ")})
          GROUP BY week, source
        ),
        current_total AS (
          SELECT countDistinct(a.memberId) AS total
          FROM activity a
          JOIN profile p FINAL ON p.memberId = a.memberId AND p.workspaceId = a.workspaceId
          WHERE a.createdAt >= '${formattedFrom}'
            AND a.createdAt <= '${formattedTo}'
            AND a.workspaceId = '${workspaceId}'
            AND p.attributes.source IN (${sources.map((source) => `'${source}'`).join(", ")})
        ),
        previous_total AS (
          SELECT countDistinct(a.memberId) AS total
          FROM activity a
          JOIN profile p FINAL ON p.memberId = a.memberId AND p.workspaceId = a.workspaceId
          WHERE a.createdAt >= '${previousFrom}'
            AND a.createdAt <= '${previousTo}'
            AND a.workspaceId = '${workspaceId}'
            AND p.attributes.source IN (${sources.map((source) => `'${source}'`).join(", ")})
        )
        SELECT 
          period_data.*,
          (SELECT total FROM current_total) AS currentTotal,
          (SELECT total FROM previous_total) AS previousTotal
        FROM period_data
        ORDER BY week ASC
      `,
    });

    const { data } = await result.json<{
      week: string;
      source: string;
      memberIds: string[];
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

    const profiles: Array<{
      week: string;
      cumulative: Record<Source, number>;
      detail: Record<Source, number>;
    }> = [];
    const cumulativeMemberIds = {} as Record<Source, Set<string>>;

    for (const source of sources) {
      cumulativeMemberIds[source] = new Set();
    }

    for (const period of periods) {
      const cumulativeData: Record<Source, number> = {} as Record<
        Source,
        number
      >;
      const detailData: Record<Source, number> = {} as Record<Source, number>;

      for (const source of sources) {
        const sourceData = data.find(
          (d) => d.week === period && d.source === source,
        );

        detailData[source] = sourceData?.memberIds?.length || 0;

        if (sourceData?.memberIds) {
          for (const id of sourceData.memberIds) {
            cumulativeMemberIds[source].add(id);
          }
        }
        cumulativeData[source] = cumulativeMemberIds[source].size;
      }

      profiles.push({
        week: period,
        cumulative: cumulativeData,
        detail: detailData,
      });
    }

    return {
      total: currentTotal,
      growthRate,
      profiles,
    };
  });

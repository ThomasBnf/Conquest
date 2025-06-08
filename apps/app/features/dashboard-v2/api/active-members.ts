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

export const activeMembers = protectedProcedure
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

    const activitiesResult = await client.query({
      query: `
        SELECT 
          ${days > 30 ? "toStartOfWeek(a.createdAt)" : "toDate(a.createdAt)"} AS period,
          a.memberId,
          p.attributes.source AS source
        FROM activity a
        JOIN profile p FINAL ON p.memberId = a.memberId AND p.workspaceId = a.workspaceId
        WHERE a.createdAt >= '${formattedFrom}'
          AND a.createdAt <= '${formattedTo}'
          AND a.workspaceId = '${workspaceId}'
          AND p.attributes.source IN (${sources.map((source) => `'${source}'`).join(", ")})
          AND p.createdAt >= '${formattedFrom}'
          AND p.createdAt <= '${formattedTo}'
        GROUP BY period, a.memberId, p.attributes.source
        ORDER BY period ASC
      `,
    });

    const totalActiveResult = await client.query({
      query: `
        SELECT countDistinct(a.memberId) AS total
        FROM activity a
        JOIN profile p FINAL ON p.memberId = a.memberId AND p.workspaceId = a.workspaceId
        WHERE a.createdAt >= '${formattedFrom}'
          AND a.createdAt <= '${formattedTo}'
          AND a.workspaceId = '${workspaceId}'
          AND p.attributes.source IN (${sources.map((source) => `'${source}'`).join(",")})
          AND p.createdAt >= '${formattedFrom}'
          AND p.createdAt <= '${formattedTo}'
      `,
    });

    const { data: activitiesData } = await activitiesResult.json();
    const { data: totalData } = (await totalActiveResult.json()) as {
      data: { total: number }[];
    };

    type ActivityData = {
      period: string;
      memberId: string;
      source: string;
    };

    type ProfileData = {
      week: string;
      [key: string]: number | string;
    };

    const activities = activitiesData as ActivityData[];

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

    const periodIndexMap = new Map<string, number>();

    for (const [index, period] of periods.entries()) {
      periodIndexMap.set(period, index);
    }

    const activitiesBySource = new Map<string, ActivityData[]>();

    for (const source of sources) {
      activitiesBySource.set(source, []);
    }

    for (const activity of activities) {
      if (activity && activitiesBySource.has(activity.source)) {
        activitiesBySource.get(activity.source)!.push(activity);
      }
    }

    const profilesWithGrowth: ProfileData[] = periods.map(
      (period, periodIndex) => {
        const result: ProfileData = { week: period };

        for (const source of sources) {
          const uniqueMembers = new Set<string>();
          const sourceActivities = activitiesBySource.get(source) || [];

          for (const activity of sourceActivities) {
            const activityPeriodIndex = periodIndexMap.get(activity.period);

            if (
              activityPeriodIndex !== undefined &&
              activityPeriodIndex <= periodIndex
            ) {
              uniqueMembers.add(activity.memberId);
            }
          }

          result[source] = uniqueMembers.size;
        }

        return result;
      },
    );

    return {
      profiles: profilesWithGrowth,
      total: totalData?.[0]?.total || 0,
    };
  });

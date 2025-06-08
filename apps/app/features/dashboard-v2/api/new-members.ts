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

export const newMembers = protectedProcedure
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

    const profilesResult = await client.query({
      query: `
        SELECT
          ${days > 30 ? "toStartOfWeek(createdAt)" : "toDate(createdAt)"} AS period,
          memberId,
          attributes.source AS source
        FROM profile FINAL
        WHERE createdAt >= '${formattedFrom}'
          AND createdAt <= '${formattedTo}'
          AND workspaceId = '${workspaceId}'
          AND attributes.source IN (${sources.map((source) => `'${source}'`).join(", ")})
        ORDER BY period ASC
      `,
    });

    const totalResult = await client.query({
      query: `
        SELECT countDistinct(memberId) AS total
        FROM profile FINAL
        WHERE createdAt >= '${formattedFrom}'
          AND createdAt <= '${formattedTo}'
          AND workspaceId = '${workspaceId}'
          AND attributes.source IN (${sources.map((source) => `'${source}'`).join(",")})
      `,
    });

    const { data: profilesData } = await profilesResult.json();
    const { data: totalData } = (await totalResult.json()) as {
      data: { total: number }[];
    };

    type ProfileData = {
      period: string;
      memberId: string;
      source: string;
    };

    type ResultData = {
      week: string;
      [key: string]: number | string;
    };

    const profiles = profilesData as ProfileData[];

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

    const profilesByPeriodAndSource = new Map<
      string,
      Map<string, Set<string>>
    >();

    for (const period of periods) {
      const sourceMap = new Map<string, Set<string>>();
      for (const source of sources) {
        sourceMap.set(source, new Set<string>());
      }
      profilesByPeriodAndSource.set(period, sourceMap);
    }

    for (const profile of profiles) {
      const periodMap = profilesByPeriodAndSource.get(profile.period);
      if (periodMap?.has(profile.source)) {
        periodMap.get(profile.source)!.add(profile.memberId);
      }
    }

    const newMembersData: ResultData[] = periods.map((period, periodIndex) => {
      const result: ResultData = { week: period };

      for (const source of sources) {
        const uniqueMembers = new Set<string>();

        for (let i = 0; i <= periodIndex; i++) {
          const currentPeriod = periods[i];
          const periodMap = profilesByPeriodAndSource.get(currentPeriod!);
          const memberSet = periodMap?.get(source);

          if (memberSet) {
            for (const memberId of memberSet) {
              uniqueMembers.add(memberId);
            }
          }
        }

        result[source] = uniqueMembers.size;
      }

      return result;
    });

    return {
      profiles: newMembersData,
      total: totalData?.[0]?.total || 0,
    };
  });

import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { differenceInDays, format } from "date-fns";
import z from "zod";

export const totalMembers = protectedProcedure
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

    console.log(formattedFrom, formattedTo);

    const profilesResult = await client.query({
      query: `
          SELECT
            ${days > 30 ? "week" : "day"} as week,
            ${sources
              .map(
                (source) =>
                  `countDistinctIf(memberId, source = '${source}') AS ${source}`,
              )
              .join(",\n      ")}
          FROM (
            SELECT
              ${days > 30 ? "toStartOfWeek(createdAt)" : "toDate(createdAt)"} AS ${
                days > 30 ? "week" : "day"
              },
              memberId,
              attributes.source AS source
            FROM profile FINAL
            WHERE createdAt >= '${formattedFrom}'
              AND createdAt <= '${formattedTo}'
              AND workspaceId = '${workspaceId}'
              AND attributes.source IN (${sources
                .map((source) => `'${source}'`)
                .join(", ")})
          )
          GROUP BY ${days > 30 ? "week" : "day"}
          ORDER BY ${days > 30 ? "week" : "day"} ASC
          WITH FILL
            FROM ${
              days > 30
                ? `toStartOfWeek(toDateTime('${formattedFrom}'))`
                : `toDate('${formattedFrom}')`
            }
            TO ${
              days > 30
                ? `toStartOfWeek(toDateTime('${formattedTo}'))`
                : `toDate('${formattedTo}')`
            }
            ${days > 30 ? "STEP toIntervalWeek(1)" : "STEP toIntervalDay(1)"}
        `,
    });

    const totalResult = await client.query({
      query: `
        SELECT
          countDistinct(memberId) AS total
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
      week: string;
      [key: string]: number | string | null;
    };

    const profilesWithGrowth = (profilesData as ProfileData[]).map(
      (current: ProfileData, index: number) => {
        const result: ProfileData = {
          week: current.week,
        };

        for (const source of sources) {
          const cumulativeTotal = (profilesData as ProfileData[])
            .slice(0, index + 1)
            .reduce((sum, data) => sum + Number(data[source] || 0), 0);

          result[source] = cumulativeTotal;
        }

        return result;
      },
    );

    return {
      profiles: profilesWithGrowth,
      total: totalData?.[0]?.total || 0,
    };
  });

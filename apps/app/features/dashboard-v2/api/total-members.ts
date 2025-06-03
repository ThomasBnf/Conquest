import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import z from "zod";

export const totalMembers = protectedProcedure
  .input(
    z.object({
      sources: z.array(SOURCE),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { sources } = input;

    const result = await client.query({
      query: `
          SELECT
            week,
            countDistinctIf(memberId, attributes.source = 'Discord') AS Discord,
            countDistinctIf(memberId, attributes.source = 'Github') AS Github,
            countDistinctIf(memberId, attributes.source = 'Slack') AS Slack
          FROM (
            SELECT
              toStartOfWeek(createdAt) AS week,
              memberId,
              attributes.source
            FROM profile FINAL
            WHERE createdAt >= toDateTime('2025-01-01')
              AND createdAt <= now()
              AND workspaceId = '${workspaceId}'
          )
          GROUP BY week
          ORDER BY week ASC
          WITH FILL
            FROM toStartOfWeek(toDateTime('2025-01-01'))
            TO toStartOfWeek(now())
            STEP toIntervalWeek(1)
        `,
      format: "JSON",
    });

    const { data } = await result.json();
    return data;
  });

import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";

export const levelRepartition = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    const result = await client.query({
      query: `
        SELECT 
          l.number as levelNumber,
          COUNT(m.id) as count,
          ROUND(COUNT(m.id) * 100.0 / SUM(COUNT(m.id)) OVER(), 1) as percentage
        FROM level l
        LEFT JOIN member m ON l.id = m.levelId
        WHERE l.workspaceId = '${workspaceId}'
          AND l.number BETWEEN 1 AND 12
        GROUP BY l.number
        ORDER BY l.number DESC
      `,
    });

    const { data } = (await result.json()) as {
      data: {
        levelNumber: number;
        count: number;
        percentage: number;
      }[];
    };

    return data;
  },
);

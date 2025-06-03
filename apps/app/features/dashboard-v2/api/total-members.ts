import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";

export const totalMembers = protectedProcedure.query(
  async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;

    const result = await client.query({
      query: `
            SELECT 
              toStartOfInterval(subtractWeeks(now(), 10), INTERVAL 1 WEEK) as week,
              COUNT(DISTINCT memberId) as totalMembers,
              COUNT() as totalProfiles
            FROM profile FINAL
            WHERE workspaceId = '${workspaceId}'
            AND attributes.source IN ('Discord', 'Github')
            GROUP BY week
            ORDER BY week ASC
          `,
      format: "JSON",
    });

    const { data } = await result.json();
    return data;
  },
);

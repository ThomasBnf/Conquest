import { client } from "@conquest/clickhouse/client";
import { ActivityHeatmapSchema } from "@conquest/zod/schemas/activity.schema";
import { format, subDays } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../../../server/trpc";

export const heatmap = protectedProcedure
  .input(
    z.object({
      memberId: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { memberId } = input;

    const today = new Date();
    const last365days = format(subDays(today, 365), "yyyy-MM-dd");

    const result = await client.query({
      query: `
        SELECT 
          toDate(createdAt) as date,
          count() as count
        FROM activity a
        JOIN member m FINAL ON a.memberId = m.id
        WHERE 
        m.workspaceId = '${workspaceId}'
        AND a.createdAt >= '${last365days}'
        ${memberId ? `AND a.memberId = '${memberId}'` : ""}
        ${memberId ? "" : "AND m.isStaff = false"}
        GROUP BY date
      `,
    });

    const { data } = await result.json();
    return ActivityHeatmapSchema.array().parse(data);
  });

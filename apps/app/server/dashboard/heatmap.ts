import { client } from "@conquest/clickhouse/client";
import { ActivityHeatmapSchema } from "@conquest/zod/schemas/activity.schema";
import { format, subDays } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const heatmap = protectedProcedure
  .input(
    z.object({
      member_id: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { member_id } = input;

    const today = new Date();
    const last365days = format(subDays(today, 365), "yyyy-MM-dd");

    const result = await client.query({
      query: `
        SELECT 
          formatDateTime(created_at, '%Y-%m-%d %H:%M:%S') as date,
          count() as count
        FROM activity
        WHERE workspace_id = '${workspace_id}'
          AND created_at >= '${last365days}'
          ${member_id ? `AND member_id = '${member_id}'` : ""}
        GROUP BY date
      `,
    });

    const { data } = await result.json();
    return ActivityHeatmapSchema.array().parse(data);
  });

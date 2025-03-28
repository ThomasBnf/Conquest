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
          toDate(created_at) as date,
          count() as count
        FROM activity
        JOIN member m ON a.member_id = m.id
        WHERE 
          m.deleted_at is NULL
          AND m.workspace_id = '${workspace_id}'
          AND created_at >= '${last365days}'
          ${member_id ? `AND member_id = '${member_id}'` : ""}
        GROUP BY date
      `,
    });

    const { data } = await result.json();
    console.log(data);
    return ActivityHeatmapSchema.array().parse(data);
  });

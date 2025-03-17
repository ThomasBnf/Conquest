import { client } from "@conquest/clickhouse/client";
import { endOfDay, format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const topActivityType = protectedProcedure
  .input(
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { from, to } = input;

    const formattedFrom = format(from, "yyyy-MM-dd HH:mm:ss");
    const formattedTo = format(endOfDay(to), "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        SELECT 
          activity_type.name,
          activity_type.source,
          COUNT(*) as count
        FROM activity
        LEFT JOIN activity_type ON activity.activity_type_id = activity_type.id
        WHERE activity.created_at >= '${formattedFrom}' 
        AND activity.created_at <= '${formattedTo}'
        AND workspace_id = '${workspace_id}'
        AND activity_type.name != ''
        GROUP BY 
          activity_type.name,
          activity_type.source
        ORDER BY count DESC
        LIMIT 10
      `,
      format: "JSON",
    });

    const { data } = (await result.json()) as {
      data: Array<{
        name: string;
        "activity_type.source": string;
        count: number;
      }>;
    };

    return data.map((item) => ({
      activity_type: `${item["activity_type.source"]} - ${item.name}`,
      count: item.count,
    }));
  });

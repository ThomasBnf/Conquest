import { client } from "@conquest/clickhouse/client";
import { endOfDay, format } from "date-fns";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const topChannels = protectedProcedure
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
          channel.name,
          COUNT(*) as count
        FROM activity
        LEFT JOIN channel ON activity.channel_id = channel.id
        WHERE activity.created_at >= '${formattedFrom}' 
        AND activity.created_at <= '${formattedTo}'
        AND channel.workspace_id = '${workspace_id}'
        GROUP BY 
          channel.name
        ORDER BY count DESC
        LIMIT 10
      `,
      format: "JSON",
    });

    const { data } = (await result.json()) as {
      data: Array<{
        name: string;
        "channel.source": string;
        count: number;
      }>;
    };

    return data.map((item) => ({
      channel: item.name,
      count: item.count,
    }));
  });

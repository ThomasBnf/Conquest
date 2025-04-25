import { client } from "@conquest/clickhouse/client";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
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
    const { workspaceId } = user;
    const { from, to } = input;

    const timeZone = "Europe/Paris";
    const fromInParis = toZonedTime(from, timeZone);
    const toInParis = toZonedTime(to, timeZone);

    const _from = format(fromInParis, "yyyy-MM-dd HH:mm:ss");
    const _to = format(toInParis, "yyyy-MM-dd HH:mm:ss");

    const result = await client.query({
      query: `
        SELECT 
          channel.name,
          channel.source,
          COUNT(*) as count
        FROM activity
        LEFT JOIN channel ON activity.channelId = channel.id
        WHERE activity.createdAt >= '${_from}' 
        AND activity.createdAt <= '${_to}'
        AND channel.workspaceId = '${workspaceId}'
        GROUP BY 
          channel.name,
          channel.source
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
      channel: `${item["channel.source"]} - #${item.name}`,
      count: item.count,
    }));
  });

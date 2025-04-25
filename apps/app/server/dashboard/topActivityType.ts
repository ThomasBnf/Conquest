import { client } from "@conquest/clickhouse/client";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
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
          activityType.name,
          activityType.source,
          COUNT(*) as count
        FROM activity
        LEFT JOIN activityType ON activity.activityTypeId = activityType.id
        WHERE activity.createdAt >= '${_from}' 
        AND activity.createdAt <= '${_to}'
        AND workspaceId = '${workspaceId}'
        AND activityType.name != ''
        GROUP BY 
          activityType.name,
          activityType.source
        ORDER BY count DESC
        LIMIT 10
      `,
      format: "JSON",
    });

    const { data } = (await result.json()) as {
      data: Array<{
        name: string;
        "activityType.source": string;
        count: number;
      }>;
    };

    return data.map((item) => ({
      activityType: `${item["activityType.source"]} - ${item.name}`,
      count: item.count,
    }));
  });

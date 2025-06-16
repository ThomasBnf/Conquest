import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { format } from "date-fns";
import z from "zod";

export const activityTypesByChannel = protectedProcedure
  .input(
    z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
      sources: z.array(SOURCE),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { from, to, sources } = input;

    const formattedFrom = format(from, "yyyy-MM-dd");
    const formattedTo = format(to, "yyyy-MM-dd");

    const activitiesResult = await client.query({
      query: `
        SELECT 
          channel.name as channel,
          activity.source as source,
          activityType.name as activityTypeName,
          COUNT(*) as count
        FROM activity
        LEFT JOIN channel ON activity.channelId = channel.id
        LEFT JOIN activityType ON activity.activityTypeId = activityType.id
        WHERE activity.workspaceId = '${workspaceId}'
          AND activity.source IN (${sources.map((s) => `'${s}'`).join(",")})
          AND activity.createdAt >= '${formattedFrom}'
          AND activity.createdAt <= '${formattedTo}'
          AND channel.name IS NOT NULL
          AND activityType.name IS NOT NULL
        GROUP BY channel.name, activity.source, activityType.name
        ORDER BY channel.name, count DESC
      `,
    });

    const { data: activitiesData } = await activitiesResult.json();

    type ActivityData = {
      channel: string;
      source: string;
      activityTypeName: string;
      count: number;
    };

    type ActivityType = {
      name: string;
      count: number;
    };

    type ChannelData = {
      channel: string;
      source: string;
      activityTypes: ActivityType[];
    };

    const activities = activitiesData as ActivityData[];

    const channelMap = new Map<
      string,
      { source: string; activityTypes: ActivityType[] }
    >();

    for (const activity of activities) {
      const key = activity.channel;

      if (!channelMap.has(key)) {
        channelMap.set(key, { source: activity.source, activityTypes: [] });
      }

      channelMap.get(key)!.activityTypes.push({
        name: activity.activityTypeName,
        count: activity.count,
      });
    }

    const result: ChannelData[] = [];

    for (const [channel, data] of channelMap) {
      result.push({
        channel,
        source: data.source,
        activityTypes: data.activityTypes.sort((a, b) => b.count - a.count),
      });
    }

    result.sort((a, b) => a.channel.localeCompare(b.channel));

    return result;
  });

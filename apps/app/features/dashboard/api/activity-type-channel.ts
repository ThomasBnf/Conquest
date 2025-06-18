import { protectedProcedure } from "@/server/trpc";
import { client } from "@conquest/clickhouse/client";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { format } from "date-fns";
import z from "zod";

export const activityTypesByChannel = protectedProcedure
  .input(
    z.object({
      dateRange: z
        .object({
          from: z.coerce.date().optional(),
          to: z.coerce.date().optional(),
        })
        .optional(),
      sources: z.array(SOURCE),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { dateRange, sources } = input;
    const { from, to } = dateRange ?? {};

    if (!from || !to) {
      return [];
    }

    const formattedFrom = format(from, "yyyy-MM-dd");
    const formattedTo = format(to, "yyyy-MM-dd");

    const activitiesResult = await client.query({
      query: `
        SELECT 
          channel.id as channelId,
          channel.name as channel,
          channel.source as source,
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
        GROUP BY channel.name, channel.source, activityType.name, channel.id
        ORDER BY channel.name, count DESC
      `,
    });

    const { data } = await activitiesResult.json();

    console.log(data);

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
      total: number;
    };

    const activities = data as ActivityData[];

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
        count: Number(activity.count),
      });
    }

    const result: ChannelData[] = [];

    for (const [channel, { source, activityTypes }] of channelMap) {
      result.push({
        channel,
        source,
        activityTypes: activityTypes.sort((a, b) => b.count - a.count),
        total: activityTypes.reduce((a, b) => a + b.count, 0),
      });
    }

    return result.sort((a, b) => b.total - a.total);
  });

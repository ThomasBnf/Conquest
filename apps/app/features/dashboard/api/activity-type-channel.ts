import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { SOURCE } from "@conquest/zod/enum/source.enum";
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

    const activities = await prisma.activity.groupBy({
      by: ["channelId", "source"],
      where: {
        workspaceId,
        source: { in: sources },
        createdAt: { gte: from, lte: to },
      },
      _count: {
        id: true,
      },
    });

    const channelActivityTypes = await prisma.activity.groupBy({
      by: ["channelId", "activityTypeKey"],
      where: {
        workspaceId,
        source: { in: sources },
        createdAt: { gte: from, lte: to },
      },
      _count: {
        id: true,
      },
    });

    const channels = await prisma.channel.findMany({
      where: {
        id: {
          in: activities.map((a) => a.channelId).filter((id) => id !== null),
        },
      },
      select: {
        id: true,
        name: true,
        source: true,
      },
    });

    const activityTypes = await prisma.activityType.findMany({
      where: {
        key: {
          in: channelActivityTypes.map((a) => a.activityTypeKey),
        },
      },
      select: {
        key: true,
        name: true,
      },
    });

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

    const channelMap = new Map<
      string,
      { source: string; activityTypes: ActivityType[] }
    >();

    for (const activity of channelActivityTypes) {
      const channel = channels.find(
        (c: { id: string }) => c.id === activity.channelId,
      );
      const activityType = activityTypes.find(
        (at) => at.key === activity.activityTypeKey,
      );

      if (!channel?.name || !activityType?.name) continue;

      const key = channel.name;

      if (!channelMap.has(key)) {
        channelMap.set(key, { source: channel.source, activityTypes: [] });
      }

      channelMap.get(key)!.activityTypes.push({
        name: activityType.name,
        count: activity._count.id,
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

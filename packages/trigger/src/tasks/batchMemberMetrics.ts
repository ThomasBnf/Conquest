import { randomUUID } from "node:crypto";
import { listActivities } from "@conquest/db/activity/listActivities";
import { getLevel } from "@conquest/db/helpers/getLevel";
import { getPulseScore } from "@conquest/db/helpers/getPulseScore";
import { prisma } from "@conquest/db/prisma";
import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import type { Log } from "@conquest/zod/schemas/logs.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import {
  eachWeekOfInterval,
  endOfDay,
  startOfDay,
  subDays,
  subWeeks,
} from "date-fns";
import { z } from "zod";

export const batchMemberMetrics = schemaTask({
  id: "batch-member-metrics",
  schema: z.object({
    members: z.array(MemberSchema),
    levels: z.array(LevelSchema),
    workspaceId: z.string(),
  }),
  run: async ({ members, levels, workspaceId }) => {
    const logs: Log[] = [];

    const today = new Date();
    const startDate = startOfDay(subWeeks(today, 52));
    const endDate = endOfDay(today);

    const intervals = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 },
    );

    const activities = await listActivities({ workspaceId, period: 365 });

    for (const member of members) {
      const memberActivities = activities?.filter(
        (activity) => activity.memberId === member.id,
      );

      for (const interval of intervals) {
        const intervalEnd = interval;
        const intervalStart = subDays(intervalEnd, 90);

        const filteredActivities = memberActivities?.filter(
          (activity) =>
            activity.createdAt >= intervalStart &&
            activity.createdAt <= intervalEnd,
        );

        const pulse = getPulseScore({ activities: filteredActivities });
        const level = getLevel({ levels, pulse });

        logs.push({
          id: randomUUID(),
          date: interval,
          pulse,
          level: level?.number ?? null,
          memberId: member.id,
          workspaceId: member.workspaceId,
        });
      }

      const { pulse, level } = logs.at(-1) ?? {};

      await prisma.member.update({
        where: { id: member.id },
        data: {
          firstActivity: memberActivities?.at(0)?.createdAt ?? null,
          lastActivity: memberActivities?.at(-1)?.createdAt ?? null,
          pulse: pulse ?? 0,
          levelNumber: level ?? null,
        },
      });

      logger.info(`${member.id}`, { member });
    }

    await prisma.log.createMany({
      data: logs,
    });
  },
});

import { listActivities } from "@conquest/clickhouse/activity/listActivities";
import { client } from "@conquest/clickhouse/client";
import { getLevel } from "@conquest/clickhouse/helpers/getLevel";
import { getPulseScore } from "@conquest/clickhouse/helpers/getPulseScore";
import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import type { Log } from "@conquest/zod/schemas/logs.schema";
import { Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import {
  eachWeekOfInterval,
  endOfDay,
  startOfDay,
  subDays,
  subWeeks,
} from "date-fns";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export const batchMemberMetrics = schemaTask({
  id: "batch-member-metrics",
  schema: z.object({
    members: z.array(MemberSchema),
    levels: z.array(LevelSchema),
    workspaceId: z.string(),
  }),
  run: async ({ members, levels, workspaceId }) => {
    const updatedMembers: Member[] = [];
    const logs: Log[] = [];

    const today = new Date();
    const startDate = startOfDay(subWeeks(today, 52));
    const endDate = endOfDay(today);

    const intervals = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 },
    );

    const activities = await listActivities({ workspaceId, period: 365 });

    for (const [index, member] of members.entries()) {
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
          levelId: level?.id ?? null,
          memberId: member.id,
          workspaceId: member.workspaceId,
        });
      }

      const { pulse, levelId } = logs.at(-1) ?? {};

      updatedMembers.push({
        ...member,
        firstActivity: memberActivities?.at(-1)?.createdAt ?? null,
        lastActivity: memberActivities?.at(0)?.createdAt ?? null,
        pulse: pulse ?? 0,
        levelId: levelId ?? null,
        updatedAt: new Date(),
      });

      logger.info(`${index}`, { member });
    }

    await client.insert({
      table: "log",
      values: logs,
      format: "JSON",
    });

    logger.info("updatedMembers", { updatedMembers });

    await client.insert({
      table: "member",
      values: updatedMembers,
      format: "JSON",
    });
  },
});

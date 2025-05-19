import { listActivities } from "@conquest/clickhouse/activity/listActivities";
import { getLevel } from "@conquest/clickhouse/helpers/getLevel";
import { getPulseScore } from "@conquest/clickhouse/helpers/getPulseScore";
import { createManyLogs } from "@conquest/clickhouse/log/createManyLogs";
import { updateMember } from "@conquest/clickhouse/member/updateMember";
import { LevelSchema } from "@conquest/zod/schemas/level.schema";
import type { Log } from "@conquest/zod/schemas/logs.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import {
  eachWeekOfInterval,
  endOfDay,
  startOfDay,
  subDays,
  subWeeks,
} from "date-fns";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export const getMemberMetrics = schemaTask({
  id: "get-member-metrics",
  schema: z.object({
    member: MemberSchema,
    levels: z.array(LevelSchema),
  }),
  run: async ({ member, levels }) => {
    const { id, workspaceId } = member;

    const today = new Date();
    const startDate = startOfDay(subWeeks(today, 52));
    const endDate = endOfDay(today);

    const intervals = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 },
    );

    const activities = await listActivities({
      memberId: id,
      period: 365,
      workspaceId,
    });

    const logs: Log[] = [];

    for (const interval of intervals) {
      const intervalEnd = interval;
      const intervalStart = subDays(intervalEnd, 90);

      const filteredActivities = activities?.filter(
        (activity) =>
          activity.createdAt >= intervalStart &&
          activity.createdAt <= intervalEnd,
      );

      const pulseScore = getPulseScore({
        activities: filteredActivities,
      });

      const level = getLevel({ levels, pulse: pulseScore });

      logs.push({
        id: randomUUID(),
        date: interval,
        pulse: pulseScore,
        levelId: level?.id ?? null,
        memberId: member.id,
        workspaceId: member.workspaceId,
      });
    }

    await createManyLogs({ logs });

    const { pulse, levelId } = logs.at(-1) ?? {};

    return await updateMember({
      ...member,
      firstActivity: activities?.at(-1)?.createdAt ?? null,
      lastActivity: activities?.at(0)?.createdAt ?? null,
      pulse: pulse ?? 0,
      levelId: levelId ?? null,
    });
  },
});

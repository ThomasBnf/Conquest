import { listActivities } from "@conquest/clickhouse/activities/listActivities";
import { client } from "@conquest/clickhouse/client";
import { getPulseScore } from "@conquest/clickhouse/helpers/getPulseScore";
import { listLevels } from "@conquest/clickhouse/levels/listLevels";
import { createManyLogs } from "@conquest/clickhouse/logs/createManyLogs";
import { listMembers } from "@conquest/clickhouse/members/listMembers";
import type { Log } from "@conquest/zod/schemas/logs.schema";
import { type Context, runs, schemaTask } from "@trigger.dev/sdk/v3";
import {
  eachWeekOfInterval,
  endOfDay,
  startOfDay,
  subDays,
  subWeeks,
} from "date-fns";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export const getAllMembersMetrics = schemaTask({
  id: "get-all-members-metrics",
  schema: z.object({
    workspace_id: z.string(),
  }),
  run: async ({ workspace_id }, { ctx }) => {
    await checkPreviousRuns(ctx, workspace_id);

    const levels = await listLevels({ workspace_id });
    const members = await listMembers({ workspace_id });

    if (members.length === 0) return;

    const today = new Date();
    const startDate = startOfDay(subWeeks(today, 52));
    const endDate = endOfDay(today);

    const intervals = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 },
    );

    await client.query({
      query: `
        ALTER TABLE log DELETE WHERE workspace_id = '${workspace_id}';
      `,
    });

    const logs: Log[] = [];
    const updatedMembers = [];

    for (const member of members) {
      const activities = await listActivities({
        member_id: member.id,
        period: 365,
        workspace_id,
      });

      let lastLog = null;

      for (const interval of intervals) {
        const intervalEnd = interval;
        const intervalStart = subDays(intervalEnd, 90);

        const filteredActivities = activities?.filter(
          (activity) =>
            activity.created_at >= intervalStart &&
            activity.created_at <= intervalEnd,
        );

        const pulseScore = getPulseScore({ activities: filteredActivities });

        const level = levels.find(
          (level) =>
            pulseScore >= level.from &&
            pulseScore <= (level.to ?? Number.POSITIVE_INFINITY),
        );

        const log = {
          id: randomUUID(),
          date: interval,
          pulse: pulseScore,
          level_id: level?.id ?? null,
          member_id: member.id,
          workspace_id: member.workspace_id,
        };

        logs.push(log);
        lastLog = log;
      }

      // Stocker les mises à jour des membres pour un bulk insert
      if (lastLog) {
        updatedMembers.push({
          ...member,
          first_activity: activities?.at(-1)?.created_at ?? null,
          last_activity: activities?.at(0)?.created_at ?? null,
          pulse: lastLog.pulse,
          level_id: lastLog.level_id,
        });
      }
    }

    // Bulk insert des logs
    if (logs.length > 0) {
      await createManyLogs({ logs });
    }

    // Bulk insert des mises à jour des membres
    if (updatedMembers.length > 0) {
      await client.insert({
        table: "member",
        values: updatedMembers.map((member) => ({
          ...member,
          updated_at: new Date(),
        })),
        format: "JSON",
      });

      // Exécuter un seul `OPTIMIZE` après les mises à jour en bulk
      await client.query({
        query: "OPTIMIZE TABLE member FINAL;",
      });
    }
  },
});

const checkPreviousRuns = async (ctx: Context, workspace_id: string) => {
  const allRuns = await runs.list({
    status: "EXECUTING",
    taskIdentifier: "get-all-members-metrics",
  });

  const currentRunId = ctx.run.id;
  const previousTasks = allRuns.data.filter(
    (run) =>
      run.id !== currentRunId && run.metadata?.workspace_id === workspace_id,
  );

  if (previousTasks.length > 0) {
    await Promise.all(
      previousTasks.map(async (run) => {
        await runs.cancel(run.id);
      }),
    );
  }
};

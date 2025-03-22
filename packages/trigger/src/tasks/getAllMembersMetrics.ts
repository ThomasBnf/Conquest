import { listActivities } from "@conquest/clickhouse/activities/listActivities";
import { getPulseScore } from "@conquest/clickhouse/helpers/getPulseScore";
import { listLevels } from "@conquest/clickhouse/levels/listLevels";
import { createManyLogs } from "@conquest/clickhouse/logs/createManyLogs";
import { listMembers } from "@conquest/clickhouse/members/listMembers";
import { updateMember } from "@conquest/clickhouse/members/updateMember";
import type { Log } from "@conquest/zod/schemas/logs.schema";
import { type Context, logger, runs, schemaTask } from "@trigger.dev/sdk/v3";
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
    await hasTasksRunning({ ctx, workspace_id });

    const levels = await listLevels({ workspace_id });
    const members = await listMembers({ workspace_id });
    const activities = await listActivities({ workspace_id, period: 365 });

    logger.info(`Found ${members.length} members`);

    const today = new Date();
    const startDate = startOfDay(subWeeks(today, 52));
    const endDate = endOfDay(today);

    const intervals = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 },
    );

    for (const [index, member] of members.entries()) {
      const logs: Log[] = [];

      const memberActivities = activities?.filter(
        (activity) => activity.member_id === member.id,
      );

      for (const interval of intervals) {
        const intervalEnd = interval;
        const intervalStart = subDays(intervalEnd, 90);

        const filteredActivities = memberActivities?.filter(
          (activity) =>
            activity.created_at >= intervalStart &&
            activity.created_at <= intervalEnd,
        );

        const pulseScore = getPulseScore({ activities: filteredActivities });

        const level = levels.find(
          (level) =>
            pulseScore >= level.from &&
            (level.to === null || pulseScore <= level.to),
        );

        logs.push({
          id: randomUUID(),
          date: interval,
          pulse: pulseScore,
          level_id: level?.id ?? null,
          member_id: member.id,
          workspace_id: member.workspace_id,
        });
      }

      await createManyLogs({ logs });
      const { pulse, level_id } = logs.at(-1) ?? {};

      await updateMember({
        ...member,
        first_activity: memberActivities?.at(-1)?.created_at ?? null,
        last_activity: memberActivities?.at(0)?.created_at ?? null,
        pulse: pulse ?? 0,
        level_id: level_id ?? null,
      });

      logger.info(`${index}`, { member });
    }
  },
});

export const hasTasksRunning = async ({
  ctx,
  workspace_id,
}: { ctx: Context; workspace_id: string }) => {
  const allRuns = await runs.list({
    status: "EXECUTING",
    taskIdentifier: "get-all-members-metrics",
  });

  const currentRunId = ctx.run.id;
  const previousTask = allRuns.data.filter(
    (run) =>
      run.id !== currentRunId && run.metadata?.workspace_id === workspace_id,
  );

  if (previousTask) {
    await Promise.all(
      previousTask.map(async (run) => {
        await runs.cancel(run.id);
      }),
    );
  }
};

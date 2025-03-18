import { listActivities } from "@conquest/clickhouse/activities/listActivities";
import { client } from "@conquest/clickhouse/client";
import { getPulseScore } from "@conquest/clickhouse/helpers/getPulseScore";
import { listLevels } from "@conquest/clickhouse/levels/listLevels";
import { updateMember } from "@conquest/clickhouse/members/updateMember";
import type { Log } from "@conquest/zod/schemas/logs.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
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
    await checkPreviousRuns(ctx, workspace_id);

    const levels = await listLevels({ workspace_id });

    const today = new Date();
    const startDate = startOfDay(subWeeks(today, 52));
    const endDate = endOfDay(today);

    const intervals = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 },
    );

    const BATCH_SIZE = 200;
    let offset = 0;

    while (true) {
      const result = await client.query({
        query: `
          SELECT * 
          FROM member
          WHERE workspace_id = '${workspace_id}'
          LIMIT ${BATCH_SIZE} 
          OFFSET ${offset}
        `,
      });

      const { data } = await result.json();
      const members = MemberSchema.array().parse(data);

      // await client.query({
      //   query: `
      //   ALTER TABLE log DELETE
      //   WHERE workspace_id = '${workspace_id}'
      //   AND member_id IN (${members.map((member) => `'${member.id}'`).join(",")})
      //   `,
      // });

      for (const member of members) {
        const activities = await listActivities({
          member_id: member.id,
          period: 365,
          workspace_id,
        });

        const logs: Log[] = [];

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

          logs.push({
            id: randomUUID(),
            date: interval,
            pulse: pulseScore,
            level_id: level?.id ?? null,
            member_id: member.id,
            workspace_id: member.workspace_id,
          });
        }

        // await createManyLogs({ logs });

        const { pulse, level_id } = logs.at(-1) ?? {};

        await updateMember({
          ...member,
          first_activity: activities?.at(-1)?.created_at ?? null,
          last_activity: activities?.at(0)?.created_at ?? null,
          pulse: pulse ?? 0,
          level_id: level_id ?? null,
        });

        logger.info(`Member ${member.id} updated`);
      }

      logger.info(`Batch completed ${offset} members`);

      if (members.length < BATCH_SIZE) break;
      offset += BATCH_SIZE;
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

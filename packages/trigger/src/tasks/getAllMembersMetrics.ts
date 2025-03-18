import { listLevels } from "@conquest/clickhouse/levels/listLevels";
import { listMembers } from "@conquest/clickhouse/members/listMembers";
import type { Log } from "@conquest/zod/schemas/logs.schema";
import { logger, runs, schemaTask } from "@trigger.dev/sdk/v3";
import {
  eachWeekOfInterval,
  endOfDay,
  startOfDay,
  subDays,
  subWeeks,
} from "date-fns";
import { z } from "zod";

export const getAllMembersMetrics = schemaTask({
  id: "get-all-members-metrics",
  schema: z.object({
    workspace_id: z.string(),
  }),
  run: async ({ workspace_id }, { ctx }) => {
    const allRuns = await runs.list({
      status: "EXECUTING",
      taskIdentifier: "get-all-members-metrics",
    });

    const currentRunId = ctx.run.id;
    const previousTask = allRuns.data.filter((run) => run.id !== currentRunId);

    if (previousTask) {
      await Promise.all(
        previousTask.map(async (run) => {
          await runs.cancel(run.id);
        }),
      );
    }

    const levels = await listLevels({ workspace_id });
    const members = await listMembers({ workspace_id });

    logger.info(`Found ${members.length} members`);

    const today = new Date();
    const startDate = startOfDay(subWeeks(today, 52));
    const endDate = endOfDay(today);

    const intervals = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 },
    );

    for (const member of members) {
      // const activities = await listActivities({
      //   member_id: member.id,
      //   period: 365,
      //   workspace_id,
      // });

      const logs: Log[] = [];

      for (const interval of intervals) {
        const intervalEnd = interval;
        const intervalStart = subDays(intervalEnd, 90);

        // const filteredActivities = activities?.filter(
        //   (activity) =>
        //     activity.created_at >= intervalStart &&
        //     activity.created_at <= intervalEnd,
        // );

        // const pulseScore = getPulseScore({ activities: filteredActivities });

        // const level = levels.find(
        //   (level) =>
        //     pulseScore >= level.from &&
        //     pulseScore <= (level.to ?? Number.POSITIVE_INFINITY),
        // );

        // logs.push({
        //   id: randomUUID(),
        //   date: interval,
        //   pulse: pulseScore,
        //   level_id: level?.id ?? null,
        //   member_id: member.id,
        //   workspace_id: member.workspace_id,
        // });
      }

      // await createManyLogs({ logs });

      const { pulse, level_id } = logs.at(-1) ?? {};

      // await updateMember({
      //   ...member,
      //   first_activity: activities?.at(-1)?.created_at ?? null,
      //   last_activity: activities?.at(0)?.created_at ?? null,
      //   pulse: pulse ?? 0,
      //   level_id: level_id ?? null,
      // });
      // }) ?? [],
      // );

      console.log(member.id);
    }
  },
});

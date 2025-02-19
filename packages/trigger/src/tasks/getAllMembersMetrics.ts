import { getPulseScore } from "@conquest/db/helpers/getPulseScore";
import { prisma } from "@conquest/db/prisma";
import { listActivitiesIn365Days } from "@conquest/db/queries/activity/listActivitiesIn365Days";
import { listLevels } from "@conquest/db/queries/levels/listLevels";
import { listMembers } from "@conquest/db/queries/member/listMembers";
import type { Log } from "@conquest/zod/schemas/member.schema";
import { runs, schemaTask } from "@trigger.dev/sdk/v3";
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

    if (!members) return;

    const today = new Date();
    const startDate = startOfDay(subWeeks(today, 52));
    const endDate = endOfDay(today);

    const intervals = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 },
    );

    await Promise.all(
      members?.map(async (member) => {
        const activities = await listActivitiesIn365Days({ member });

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
            date: interval.toString(),
            pulse: pulseScore,
            levelId: level?.id ?? null,
          });
        }

        const { pulse, levelId } = logs.at(-1) ?? {};

        await prisma.member.update({
          where: {
            id: member.id,
          },
          data: {
            pulse,
            level_id: levelId,
            logs,
            first_activity: activities?.at(0)?.created_at,
            last_activity: activities?.at(-1)?.created_at,
          },
        });
      }) ?? [],
    );
  },
});

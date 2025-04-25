import { listLevels } from "@conquest/clickhouse/levels/listLevels";
import { deleteAllLogs } from "@conquest/clickhouse/logs/deleteAllLogs";
import { listMembers } from "@conquest/clickhouse/members/listMembers";
import { type Context, logger, runs, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { batchMemberMetrics } from "./batchMemberMetrics";

export const getAllMembersMetrics = schemaTask({
  id: "get-all-members-metrics",
  schema: z.object({
    workspaceId: z.string(),
  }),
  run: async ({ workspaceId }, { ctx }) => {
    await hasTasksRunning({ ctx, workspaceId });

    const levels = await listLevels({ workspaceId });
    await deleteAllLogs({ workspaceId });

    const BATCH_SIZE = 200;
    let offset = 0;
    const batchPromises = [];

    while (true) {
      const members = await listMembers({
        workspaceId,
        limit: BATCH_SIZE,
        offset,
      });

      if (members.length === 0) break;

      const batchPromise = batchMemberMetrics.batchTriggerAndWait([
        {
          payload: {
            members,
            levels,
            workspaceId,
          },
          options: {
            metadata: { workspaceId },
          },
        },
      ]);

      batchPromises.push(batchPromise);
      logger.info("members", { count: members.length });

      if (members.length < BATCH_SIZE) break;
      offset += BATCH_SIZE;
    }
  },
});

export const hasTasksRunning = async ({
  ctx,
  workspaceId,
}: { ctx: Context; workspaceId: string }) => {
  const allRuns = await runs.list({
    status: "EXECUTING",
    taskIdentifier: "get-all-members-metrics",
  });

  const currentRunId = ctx.run.id;
  const previousTask = allRuns.data.filter(
    (run) =>
      run.id !== currentRunId && run.metadata?.workspaceId === workspaceId,
  );

  if (previousTask) {
    await Promise.all(
      previousTask.map(async (run) => {
        await runs.cancel(run.id);
      }),
    );
  }
};

import { listLevels } from "@conquest/clickhouse/levels/listLevels";
import { deleteAllLogs } from "@conquest/clickhouse/logs/deleteAllLogs";
import { listMembers } from "@conquest/clickhouse/members/listMembers";
import { type Context, logger, runs, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { batchMemberMetrics } from "./batchMemberMetrics";

export const getAllMembersMetrics = schemaTask({
  id: "get-all-members-metrics",
  schema: z.object({
    workspace_id: z.string(),
  }),
  run: async ({ workspace_id }, { ctx }) => {
    await hasTasksRunning({ ctx, workspace_id });

    const levels = await listLevels({ workspace_id });
    await deleteAllLogs({ workspace_id });

    const BATCH_SIZE = 200;
    let offset = 0;

    while (true) {
      const members = await listMembers({
        workspace_id,
        limit: BATCH_SIZE,
        offset,
      });

      await batchMemberMetrics.batchTrigger([
        {
          payload: {
            members,
            levels,
            workspace_id,
          },
          options: {
            metadata: { workspace_id },
          },
        },
      ]);

      logger.info("members", { count: members.length });

      if (members.length < BATCH_SIZE) break;
      offset += BATCH_SIZE;
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

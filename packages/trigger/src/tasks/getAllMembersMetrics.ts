import { client } from "@conquest/clickhouse/client";
import { type Context, logger, runs, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { launchBatchMembersMetrics } from "./launchBatchMembersMetrics";

export const getAllMembersMetrics = schemaTask({
  id: "get-all-members-metrics",
  schema: z.object({
    workspace_id: z.string(),
  }),
  run: async ({ workspace_id }, { ctx }) => {
    await hasTasksRunning({ ctx, workspace_id });

    await launchBatchMembersMetrics.triggerAndWait({ workspace_id });

    logger.info("Optimizing table member FINAL");

    await client.query({ query: "OPTIMIZE TABLE member FINAL;" });

    logger.info("Table member FINAL optimisée avec succès");
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

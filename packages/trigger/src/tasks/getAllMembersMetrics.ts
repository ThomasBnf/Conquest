import { client } from "@conquest/clickhouse/client";
import { listLevels } from "@conquest/clickhouse/levels/listLevels";
import { listMembers } from "@conquest/clickhouse/members/listMembers";
import { type Context, runs, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { getMemberMetrics } from "./getMemberMetrics";

export const getAllMembersMetrics = schemaTask({
  id: "get-all-members-metrics",
  schema: z.object({
    workspace_id: z.string(),
  }),
  run: async ({ workspace_id }, { ctx }) => {
    await checkPreviousRuns(ctx, workspace_id);

    const levels = await listLevels({ workspace_id });
    const members = await listMembers({ workspace_id });

    if (!members) return;

    await client.query({
      query: `ALTER TABLE log DELETE WHERE workspace_id = '${workspace_id}'`,
    });

    const BATCH_SIZE = 500;

    for (let i = 0; i < members.length; i += BATCH_SIZE) {
      const membersBatch = members.slice(i, i + BATCH_SIZE);

      await getMemberMetrics.batchTrigger(
        membersBatch.map((member) => ({
          payload: {
            member,
            levels,
          },
          options: {
            idempotencyKey: `get-metrics-${member.id}`,
            concurrencyKey: `metrics-${workspace_id}`,
            queue: {
              name: "members-processing-queue",
              concurrencyLimit: 5,
            },
          },
        })),
      );
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

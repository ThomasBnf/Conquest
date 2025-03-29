import { listLevels } from "@conquest/clickhouse/levels/listLevels";
import { deleteAllLogs } from "@conquest/clickhouse/logs/deleteAllLogs";
import { listMembers } from "@conquest/clickhouse/members/listMembers";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { batchMemberMetrics } from "./batchMemberMetrics";

export const launchBatchMembersMetrics = schemaTask({
  id: "launch-batch-members-metrics",
  schema: z.object({
    workspace_id: z.string(),
  }),
  run: async ({ workspace_id }) => {
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

      if (members.length === 0) break;

      batchMemberMetrics.batchTriggerAndWait([
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

      if (members.length < BATCH_SIZE) break;
      offset += BATCH_SIZE;
    }
  },
});

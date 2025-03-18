import { client } from "@conquest/clickhouse/client";
import { listLevels } from "@conquest/clickhouse/levels/listLevels";
import { listMembers } from "@conquest/clickhouse/members/listMembers";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { getMemberMetrics } from "./getMemberMetrics";

export const getAllMembersMetrics = schemaTask({
  id: "get-all-members-metrics",
  schema: z.object({
    workspace_id: z.string(),
  }),
  run: async ({ workspace_id }) => {
    const levels = await listLevels({ workspace_id });
    const members = await listMembers({ workspace_id });

    if (!members) return;

    await client.query({
      query: `ALTER TABLE log DELETE WHERE workspace_id = '${workspace_id}'`,
    });

    await getMemberMetrics.batchTrigger(
      members.map((member) => ({
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
  },
});

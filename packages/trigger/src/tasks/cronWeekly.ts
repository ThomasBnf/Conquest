import { client } from "@conquest/clickhouse/client";
import { listMembers } from "@conquest/clickhouse/member/listMembers";
import { listWorkspaces } from "@conquest/db/workspaces/listWorkspaces";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import { batchWeeklyLog } from "./batchWeeklyLog";

export const cronWeekly = schedules.task({
  id: "cron-weekly",
  cron: "0 0 * * 1",
  run: async (_, { ctx }) => {
    if (ctx.environment.type === "DEVELOPMENT") return;

    const workspaces = await listWorkspaces();

    for (const workspace of workspaces) {
      const { id: workspaceId } = workspace;

      const BATCH_SIZE = 500;
      let offset = 0;

      while (true) {
        const members = await listMembers({
          workspaceId,
          limit: BATCH_SIZE,
          offset,
        });

        logger.info("members", { count: members.length });

        await batchWeeklyLog.batchTrigger([
          {
            payload: { members },
            options: { metadata: { workspaceId } },
          },
        ]);

        if (members.length < BATCH_SIZE) break;
        offset += BATCH_SIZE;
      }
    }

    await client.query({
      query: `
        ALTER TABLE log
        DELETE WHERE date < subtractWeeks(now(), 53)
      `,
    });
  },
});

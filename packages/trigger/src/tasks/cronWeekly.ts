import { createLog } from "@conquest/clickhouse/logs/createLog";
import { batchMembers } from "@conquest/clickhouse/members/batchMembers";
import type { Log } from "@conquest/zod/schemas/logs.schema";
import { schedules } from "@trigger.dev/sdk/v3";
import { startOfWeek } from "date-fns";

export const cronWeekly = schedules.task({
  id: "cron-weekly",
  cron: "0 0 * * 1",
  run: async (_, { ctx }) => {
    if (ctx.environment.type === "DEVELOPMENT") return;

    const BATCH_SIZE = 100;

    let cursor: string | undefined;

    while (true) {
      const batch = await batchMembers({
        limit: BATCH_SIZE,
        offset: cursor ? 1 : 0,
      });

      if (batch.length === 0) break;

      await Promise.all(
        batch.map(async (member) => {
          const { level_id, pulse } = member;

          const log: Omit<Log, "id"> = {
            date: startOfWeek(new Date(), { weekStartsOn: 1 }),
            pulse,
            level_id: level_id ?? null,
            member_id: member.id,
            workspace_id: member.workspace_id,
          };

          await createLog({ log });
        }),
      );

      cursor = batch[batch.length - 1]?.id;
    }
  },
});

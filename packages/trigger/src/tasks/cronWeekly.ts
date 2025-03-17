import { createLog } from "@conquest/clickhouse/logs/createLog";
import { listAllMembers } from "@conquest/clickhouse/members/listAllMembers";
import type { Log } from "@conquest/zod/schemas/logs.schema";
import { schedules } from "@trigger.dev/sdk/v3";
import { startOfWeek } from "date-fns";

export const cronWeekly = schedules.task({
  id: "cron-weekly",
  cron: "0 0 * * 1",
  run: async (_, { ctx }) => {
    if (ctx.environment.type === "DEVELOPMENT") return;

    const members = await listAllMembers();

    for (const member of members) {
      const { level_id, pulse } = member;

      const log: Omit<Log, "id"> = {
        date: startOfWeek(new Date(), { weekStartsOn: 1 }),
        pulse,
        level_id: level_id ?? null,
        member_id: member.id,
        workspace_id: member.workspace_id,
      };

      await createLog({ log });
    }
  },
});

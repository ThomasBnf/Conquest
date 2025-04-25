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
      const { levelId, pulse } = member;

      const log: Omit<Log, "id"> = {
        date: startOfWeek(new Date(), { weekStartsOn: 1 }),
        pulse,
        levelId: levelId ?? null,
        memberId: member.id,
        workspaceId: member.workspaceId,
      };

      await createLog({ log });
    }
  },
});

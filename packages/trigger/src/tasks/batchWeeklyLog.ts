import { client } from "@conquest/clickhouse/client";
import type { Log } from "@conquest/zod/schemas/logs.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { startOfWeek } from "date-fns";
import { z } from "zod";

export const batchWeeklyLog = schemaTask({
  id: "batch-weekly-log",
  schema: z.object({
    members: z.array(MemberSchema),
  }),
  run: async ({ members }) => {
    const logs: Omit<Log, "id">[] = [];

    for (const member of members) {
      const { levelId, pulse } = member;

      logs.push({
        date: startOfWeek(new Date(), { weekStartsOn: 1 }),
        pulse,
        levelId: levelId ?? null,
        memberId: member.id,
        workspaceId: member.workspaceId,
      });
    }

    await client.insert({
      table: "log",
      values: logs,
      format: "JSON",
    });
  },
});

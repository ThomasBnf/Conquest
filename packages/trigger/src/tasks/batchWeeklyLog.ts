import { prisma } from "@conquest/db/prisma";
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
      const { levelNumber, pulse } = member;

      logs.push({
        date: startOfWeek(new Date(), { weekStartsOn: 1 }),
        pulse,
        level: levelNumber,
        memberId: member.id,
        workspaceId: member.workspaceId,
      });
    }

    await prisma.log.createMany({
      data: logs,
    });
  },
});

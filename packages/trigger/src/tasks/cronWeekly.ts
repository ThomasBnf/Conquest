import { prisma } from "@conquest/db/prisma";
import type { Log } from "@conquest/zod/schemas/member.schema";
import { schedules } from "@trigger.dev/sdk/v3";

export const cronWeekly = schedules.task({
  id: "cron-weekly",
  cron: "0 0 * * 1",
  run: async (_, { ctx }) => {
    if (ctx.environment.type === "DEVELOPMENT") return;

    const BATCH_SIZE = 100;

    let cursor: string | undefined;

    while (true) {
      const batch = await prisma.member.findMany({
        take: BATCH_SIZE,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: "asc",
        },
      });

      if (batch.length === 0) break;

      await Promise.all(
        batch.map(async (member) => {
          const { level_id, pulse } = member;

          const newLogs: Log = {
            date: new Date().toISOString(),
            pulse,
            levelId: level_id,
          };

          await prisma.member.update({
            where: { id: member.id },
            data: {
              logs: {
                push: newLogs,
              },
            },
          });
        }),
      );

      cursor = batch[batch.length - 1]?.id;
    }
  },
});

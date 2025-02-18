import { prisma } from "@conquest/db/prisma";
import { schedules } from "@trigger.dev/sdk/v3";
import { getMemberMetrics } from "./getMemberMetrics";

export const cronWeekly = schedules.task({
  id: "cron-weekly",
  cron: "0 0 * * 1",
  run: async () => {
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
        batch.map((member) =>
          getMemberMetrics.trigger({ memberId: member.id }),
        ),
      );

      cursor = batch[batch.length - 1]?.id;
    }
  },
});

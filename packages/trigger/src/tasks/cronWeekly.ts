import { listMembers } from "@conquest/db/member/listMembers";
import { prisma } from "@conquest/db/prisma";
import { listWorkspaces } from "@conquest/db/workspaces/listWorkspaces";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import { subWeeks } from "date-fns";
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

    await prisma.log.deleteMany({
      where: {
        date: {
          lt: subWeeks(new Date(), 53),
        },
      },
    });
  },
});

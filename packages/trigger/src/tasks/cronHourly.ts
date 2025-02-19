import { prisma } from "@conquest/db/prisma";
import { getMemberMetrics } from "@conquest/db/queries/member/getMemberMetrics";
import { schedules } from "@trigger.dev/sdk/v3";
import { endOfHour, startOfHour, subHours } from "date-fns";

export const cronHourly = schedules.task({
  id: "cron-hourly",
  cron: "0 * * * *",
  run: async (_, { ctx }) => {
    if (ctx.environment.type === "DEVELOPMENT") return;

    const now = new Date();
    const startOfLastHour = startOfHour(subHours(now, 1));
    const endOfLastHour = endOfHour(subHours(now, 1));

    const members = await prisma.activity.groupBy({
      by: ["member_id"],
      where: {
        created_at: {
          gte: startOfLastHour,
          lt: endOfLastHour,
        },
      },
    });

    await Promise.all(
      members.map(async (member) => {
        await getMemberMetrics({ memberId: member.member_id });
      }),
    );
  },
});

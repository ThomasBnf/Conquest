import { prisma } from "@conquest/db/prisma";
import { schedules } from "@trigger.dev/sdk/v3";
import { endOfHour, startOfHour, subHours } from "date-fns";
import { getMemberMetrics } from "./getMemberMetrics";

export const cronHourly = schedules.task({
  id: "cron-hourly",
  cron: "0 * * * *",
  run: async () => {
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

    for (const member of members) {
      await getMemberMetrics.trigger({ memberId: member.member_id });
    }
  },
});

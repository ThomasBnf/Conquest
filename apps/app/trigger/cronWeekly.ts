import { prisma } from "@/lib/prisma";
import { listActivitiesIn365Days } from "@/queries/activities/listActivitiesIn365Days";
import { getMember } from "@/queries/members/getMember";
import { getMemberMetrics } from "@/queries/members/getMemberMetrics";
import type { Log } from "@conquest/zod/schemas/member.schema";
import { schedules } from "@trigger.dev/sdk/v3";
import { startOfDay, subDays } from "date-fns";

export const cronWeekly = schedules.task({
  id: "cron-weekly",
  cron: "0 0 * * 1",
  run: async () => {
    const today = startOfDay(new Date());
    const lastWeek = startOfDay(subDays(today, 7));

    const weeklyActivities = await prisma.activities.findMany({
      where: {
        created_at: {
          gte: lastWeek,
          lt: today,
        },
      },
      select: {
        member_id: true,
        workspace_id: true,
      },
      distinct: ["member_id", "workspace_id"],
    });

    const members = weeklyActivities.map((activity) => ({
      id: activity.member_id,
      workspace_id: activity.workspace_id,
    }));

    for (const { id, workspace_id } of members) {
      const member = await getMember({ id, workspace_id });

      if (!member) continue;

      const activities = await listActivitiesIn365Days({ member });
      const metrics = await getMemberMetrics({ activities, today });

      const newLog: Log = {
        date: today.toISOString(),
        ...metrics,
      };

      const { pulse, presence, level } = metrics;

      await prisma.members.update({
        where: {
          id,
          workspace_id,
        },
        data: {
          pulse,
          presence,
          level,
          logs: {
            push: newLog,
          },
        },
      });
    }
  },
});

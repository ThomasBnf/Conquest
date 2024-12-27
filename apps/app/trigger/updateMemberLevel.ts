import { prisma } from "@/lib/prisma";
import { getMembersMetrics } from "@/queries/members/getMembersMetrics";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { schedules } from "@trigger.dev/sdk/v3";
import { endOfDay, startOfDay, subDays } from "date-fns";

export const updateMemberLevel = schedules.task({
  id: "update-member-level",
  cron: "0 0 * * *",
  run: async () => {
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const members = MemberSchema.array().parse(
      await prisma.activities.groupBy({
        by: ["member_id"],
        where: {
          created_at: {
            gte: yesterdayStart,
            lte: yesterdayEnd,
          },
        },
      }),
    );

    console.log(members);
    console.log(yesterdayStart);
    console.log(yesterdayEnd);

    for (const member of members) {
      await getMembersMetrics({ member });
    }
  },
});

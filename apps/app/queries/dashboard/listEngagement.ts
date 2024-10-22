import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { differenceInDays, format, subDays } from "date-fns";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const listEngagement = authAction
  .metadata({ name: "engagement" })
  .schema(
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  )
  .action(async ({ ctx, parsedInput: { from, to } }) => {
    const members = await prisma.member.findMany({
      where: {
        workspace_id: ctx.user.workspace_id,
      },
      include: {
        activities: {
          where: {
            created_at: {
              gte: from,
              lte: to,
            },
          },
        },
      },
    });

    const parsedMembers = MemberWithActivitiesSchema.array().parse(members);
    const totalMembers = members.length;
    const dailyEngagement: { date: string; engagement: number }[] = [];

    const daysDifference = differenceInDays(to, from) + 1;

    for (let i = 0; i < daysDifference; i++) {
      const currentDate = subDays(to, i);
      const formattedDate = format(currentDate, "yyyy-MM-dd");

      let activeMembersCount = 0;

      for (const member of parsedMembers) {
        const hasActivityOnDate = member.activities.some(
          (activity) =>
            format(activity.created_at, "yyyy-MM-dd") === formattedDate,
        );
        if (hasActivityOnDate) {
          activeMembersCount++;
        }
      }

      const engagementRate = (activeMembersCount / totalMembers) * 100;
      dailyEngagement.push({ date: formattedDate, engagement: engagementRate });
    }

    return dailyEngagement.reverse();
  });

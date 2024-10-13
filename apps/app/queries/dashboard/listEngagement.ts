import { differenceInDays, format, subDays } from "date-fns";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { ContactWithActivitiesSchema } from "schemas/activity.schema";
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
    const contacts = await prisma.contact.findMany({
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

    const parsedContacts = ContactWithActivitiesSchema.array().parse(contacts);
    const totalContacts = contacts.length;
    const dailyEngagement: { date: string; engagement: number }[] = [];

    const daysDifference = differenceInDays(to, from) + 1;

    for (let i = 0; i < daysDifference; i++) {
      const currentDate = subDays(to, i);
      const formattedDate = format(currentDate, "yyyy-MM-dd");

      let activeContactsCount = 0;

      for (const contact of parsedContacts) {
        const hasActivityOnDate = contact.activities.some(
          (activity) =>
            format(activity.created_at, "yyyy-MM-dd") === formattedDate,
        );
        if (hasActivityOnDate) {
          activeContactsCount++;
        }
      }

      const engagementRate = (activeContactsCount / totalContacts) * 100;
      dailyEngagement.push({ date: formattedDate, engagement: engagementRate });
    }

    return dailyEngagement.reverse();
  });

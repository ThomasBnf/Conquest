import { differenceInCalendarDays, subDays } from "date-fns";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const engagementRate = authAction
  .metadata({
    name: "engagementRate",
  })
  .schema(
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  )
  .action(async ({ ctx, parsedInput: { from, to } }) => {
    const totalContacts = await prisma.contact.count({
      where: {
        workspace_id: ctx.user.workspace_id,
      },
    });

    const activeContacts = await prisma.contact.count({
      where: {
        workspace_id: ctx.user.workspace_id,
        activities: {
          some: {
            created_at: {
              gte: from,
              lte: to,
            },
          },
        },
      },
    });

    const currentEngagementRate = (activeContacts / totalContacts) * 100;

    const differenceInDays = differenceInCalendarDays(to, from);

    const previousPeriodActiveContacts = await prisma.contact.count({
      where: {
        workspace_id: ctx.user.workspace_id,
        activities: {
          some: {
            created_at: {
              gte: subDays(from, differenceInDays + 1),
              lte: subDays(from, 1),
            },
          },
        },
      },
    });

    const previousPeriodEngagementRate =
      (previousPeriodActiveContacts / totalContacts) * 100;

    const contactsWithActivities = await prisma.contact.count({
      where: {
        workspace_id: ctx.user.workspace_id,
        activities: {
          some: {},
        },
      },
    });

    const totalEngagementRate = (contactsWithActivities / totalContacts) * 100;

    return {
      totalEngagementRate,
      currentEngagementRate,
      previousPeriodEngagementRate,
    };
  });

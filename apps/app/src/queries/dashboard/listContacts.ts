import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { differenceInCalendarDays, subDays } from "date-fns";
import { z } from "zod";

export const listContacts = authAction
  .metadata({
    name: "listContacts",
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
        workspace_id: ctx.user?.workspace_id,
      },
    });

    const currentContacts = await prisma.contact.count({
      where: {
        workspace_id: ctx.user?.workspace_id,
        created_at: {
          gte: from,
          lte: to,
        },
      },
    });

    const differenceInDays = differenceInCalendarDays(to, from);

    const previousPeriodContacts = await prisma.contact.count({
      where: {
        workspace_id: ctx.user?.workspace_id,
        created_at: {
          gte: subDays(from, differenceInDays + 1),
          lte: subDays(from, 1),
        },
      },
    });

    return {
      totalContacts,
      currentContacts,
      previousPeriodContacts,
    };
  });

"use server";

import { differenceInCalendarDays, subDays } from "date-fns";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const listActivities = authAction
  .metadata({
    name: "listActivities",
  })
  .schema(
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  )
  .action(async ({ ctx, parsedInput: { from, to } }) => {
    const totalActivities = await prisma.activity.count({
      where: {
        workspace_id: ctx.user?.workspace_id,
      },
    });

    const currentActivities = await prisma.activity.count({
      where: {
        workspace_id: ctx.user?.workspace_id,
        created_at: {
          gte: from,
          lte: to,
        },
      },
    });

    const differenceInDays = differenceInCalendarDays(to, from);

    const previousPeriodActivities = await prisma.activity.count({
      where: {
        workspace_id: ctx.user?.workspace_id,
        created_at: {
          gte: subDays(from, differenceInDays + 1),
          lte: subDays(from, 1),
        },
      },
    });

    return {
      totalActivities,
      currentActivities,
      previousPeriodActivities,
    };
  });

"use server";

import { differenceInCalendarDays, subDays } from "date-fns";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const listActiveMembers = authAction
  .metadata({
    name: "listActiveMembers",
  })
  .schema(
    z.object({
      from: z.date(),
      to: z.date(),
    }),
  )
  .action(async ({ ctx, parsedInput: { from, to } }) => {
    const totalActive = await prisma.member.count({
      where: {
        workspace_id: ctx.user?.workspace_id,
        activities: {
          some: {},
        },
      },
    });

    const currentActive = await prisma.member.count({
      where: {
        workspace_id: ctx.user?.workspace_id,
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

    const differenceInDays = differenceInCalendarDays(to, from);

    const previousPeriodActive = await prisma.member.count({
      where: {
        workspace_id: ctx.user?.workspace_id,
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

    return {
      currentActive,
      previousPeriodActive,
      totalActive,
    };
  });

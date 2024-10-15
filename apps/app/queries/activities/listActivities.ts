"use server";

import { ActivityWithContactSchema } from "@conquest/zod/activity.schema";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const listActivities = authAction
  .metadata({
    name: "listActivities",
  })
  .schema(
    z.object({
      contact_id: z.string().optional(),
      from: z.date().nullable().optional(),
      to: z.date().nullable().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput: { contact_id, from, to } }) => {
    const activities = await prisma.activity.findMany({
      where: {
        contact_id,
        workspace_id: ctx.user.workspace_id,
        created_at: {
          gte: from ?? subDays(startOfDay(new Date()), 30),
          lte: to ?? endOfDay(new Date()),
        },
      },
      include: {
        contact: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return ActivityWithContactSchema.array().parse(activities);
  });

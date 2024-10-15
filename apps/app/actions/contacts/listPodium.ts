"use server";

import { ContactWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const listPodium = authAction
  .metadata({ name: "listPodium" })
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
        AND: [
          {
            activities: {
              every: {
                created_at: {
                  gte: from,
                  lte: to,
                },
              },
            },
          },
          {
            activities: {
              some: {},
            },
          },
        ],
      },
      include: {
        activities: true,
      },
      orderBy: {
        activities: {
          _count: "desc",
        },
      },
      take: 3,
    });

    return ContactWithActivitiesSchema.array().parse(contacts);
  });

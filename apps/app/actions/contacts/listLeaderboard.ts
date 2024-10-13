"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { ContactWithActivitiesSchema } from "schemas/activity.schema";
import { z } from "zod";

export const listLeaderboard = authAction
  .metadata({ name: "listLeaderboard" })
  .schema(
    z.object({
      page: z.number().default(0),
      from: z.date(),
      to: z.date(),
    }),
  )
  .action(async ({ ctx, parsedInput: { page, from, to } }) => {
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
      take: 20,
      skip: page * 20,
    });

    return ContactWithActivitiesSchema.array().parse(contacts);
  });

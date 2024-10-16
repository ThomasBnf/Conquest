"use server";

import { ContactWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const getContact = authAction
  .metadata({
    name: "getContact",
  })
  .schema(
    z.object({
      id: z.string().optional(),
      slack_id: z.string().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id, slack_id } }) => {
    const contact = await prisma.contact.findUnique({
      where: {
        id,
        slack_id,
        workspace_id: ctx.user.workspace_id,
      },
      include: {
        activities: true,
      },
    });

    return ContactWithActivitiesSchema.parse(contact);
  });

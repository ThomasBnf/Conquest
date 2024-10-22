"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { ActivitySchema } from "@conquest/zod/activity.schema";
import { z } from "zod";

export const getActivity = authAction
  .metadata({
    name: "getActivity",
  })
  .schema(
    z.object({
      id: z.string().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    const activity = await prisma.activity.findFirst({
      where: {
        id,
        workspace_id: ctx.user.workspace_id,
      },
    });

    return ActivitySchema.parse(activity);
  });

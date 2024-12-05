"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { ActivityTypeSchema } from "@conquest/zod/activity-type.schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const editActivityType = authAction
  .metadata({
    name: "editActivityType",
  })
  .schema(
    z.object({
      id: z.string(),
      name: z.string().min(1),
      weight: z.coerce.number().min(0).max(12),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { id, name, weight } }) => {
    const slug = user.workspace.slug;
    const workspace_id = user.workspace_id;

    const activityType = await prisma.activities_types.update({
      where: {
        id,
        workspace_id,
      },
      data: {
        name,
        weight,
      },
    });

    revalidatePath(`/app/${slug}/settings/activities-types`);
    return ActivityTypeSchema.parse(activityType);
  });

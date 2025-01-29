"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@conquest/db/prisma";
import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
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

    // if (activityType.weight === weight) {
    //   calculateMembersLevel.trigger({ workspace_id });
    // }

    revalidatePath(`/app/${slug}/settings/activity-types`);
    return ActivityTypeSchema.parse(activityType);
  });

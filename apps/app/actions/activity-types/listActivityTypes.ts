"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@conquest/database";
import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";

export const listActivityTypes = authAction
  .metadata({
    name: "listActivityTypes",
  })
  .action(async ({ ctx: { user } }) => {
    const workspace_id = user.workspace_id;

    const activitiesTypes = await prisma.activities_types.findMany({
      where: {
        workspace_id,
      },
      orderBy: {
        weight: "desc",
      },
    });

    return ActivityTypeSchema.array().parse(activitiesTypes);
  });

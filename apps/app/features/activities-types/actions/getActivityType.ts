"use server";

import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import {
  ActivityTypeSchema,
  KEYSchema,
} from "@conquest/zod/activity-type.schema";
import { z } from "zod";

export const getActivityType = safeAction
  .metadata({
    name: "getActivityType",
  })
  .schema(
    z.object({
      key: KEYSchema,
      workspace_id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { key, workspace_id } }) => {
    const activityType = await prisma.activities_types.findFirst({
      where: {
        workspace_id,
        key,
      },
    });

    return ActivityTypeSchema.parse(activityType);
  });

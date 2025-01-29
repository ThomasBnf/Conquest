"use server";

import { authAction } from "@/lib/authAction";
import { CustomError } from "@/lib/safeAction";
import { prisma } from "@conquest/db/prisma";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createActivityType = authAction
  .metadata({
    name: "createActivityType",
  })
  .schema(
    z.object({
      source: SOURCE,
      name: z.string().min(1),
      key: z.string().min(1),
      weight: z.coerce.number().min(0).max(12),
    }),
  )
  .action(
    async ({ ctx: { user }, parsedInput: { source, name, key, weight } }) => {
      const slug = user.workspace.slug;
      const workspace_id = user.workspace_id;

      const existingActivityType = await prisma.activities_types.findFirst({
        where: {
          workspace_id,
          key,
        },
      });

      if (existingActivityType) {
        throw new CustomError(
          "An activity type with this key already exists",
          400,
        );
      }

      const activityType = await prisma.activities_types.create({
        data: {
          workspace_id,
          source,
          name,
          key,
          weight,
        },
      });

      revalidatePath(`/app/${slug}/settings/activities-types`);
      return ActivityTypeSchema.parse(activityType);
    },
  );

"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@conquest/database";
import { SOURCE } from "@conquest/zod/schemas/enum/source.enum";
import { z } from "zod";

export const createActivitiesTypes = authAction
  .metadata({
    name: "createActivitiesTypes",
  })
  .schema(
    z.object({
      activity_types: z.array(
        z.object({
          name: z.string(),
          source: SOURCE,
          key: z.string(),
          weight: z.number(),
          deletable: z.boolean(),
        }),
      ),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { activity_types } }) => {
    const { workspace_id } = user;

    await prisma.activities_types.createMany({
      data: activity_types.map((activity_type) => {
        const { name, source, key, weight, deletable } = activity_type;

        return {
          name,
          source,
          key,
          weight,
          deletable,
          workspace_id,
        };
      }),
    });
  });

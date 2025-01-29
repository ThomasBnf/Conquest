"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@conquest/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const deleteActivityType = authAction
  .metadata({
    name: "deleteActivityType",
  })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { id } }) => {
    const workspace_id = user.workspace_id;

    await prisma.activities_types.delete({
      where: {
        id,
        workspace_id,
      },
    });

    revalidatePath("/settings/activities-types");
    return { success: true };
  });

"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const deleteActivityAction = authAction
  .metadata({
    name: "deleteActivityAction",
  })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    await prisma.activity.delete({
      where: {
        id,
        workspace_id: ctx.user.workspace_id,
      },
    });

    return revalidatePath("/activities");
  });

"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { z } from "zod";

export const deleteActivity = authAction
  .metadata({
    name: "deleteActivity",
  })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;
    const workspace_id = ctx.user.workspace_id;

    await prisma.activities.delete({
      where: {
        id,
        workspace_id,
      },
    });

    return revalidatePath("/activities");
  });

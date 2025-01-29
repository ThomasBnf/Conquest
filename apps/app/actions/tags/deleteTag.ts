"use server";

import { prisma } from "@conquest/db/prisma";
import { authAction } from "lib/authAction";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const deleteTag = authAction
  .metadata({ name: "deleteTag" })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    await prisma.tags.delete({
      where: { id, workspace_id: ctx.user.workspace_id },
    });

    return revalidatePath(`/${ctx.user.workspace_id}/settings/tags`);
  });

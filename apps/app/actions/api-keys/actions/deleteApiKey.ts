"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const deleteApiKey = authAction
  .metadata({ name: "deleteApiKey" })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    const slug = ctx.user.workspace.slug;
    const workspace_id = ctx.user.workspace_id;

    await prisma.apikeys.delete({
      where: {
        id,
        workspace_id,
      },
    });

    return revalidatePath(`/${slug}/settings/api`);
  });

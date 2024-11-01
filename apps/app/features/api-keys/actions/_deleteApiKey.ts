"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const _deleteApiKey = authAction
  .metadata({ name: "_deleteApiKey" })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    const slug = ctx.user.workspace.slug;

    await prisma.apiKey.delete({
      where: {
        id,
        user_id: ctx.user.id,
      },
    });

    return revalidatePath(`/${slug}/settings/api`);
  });

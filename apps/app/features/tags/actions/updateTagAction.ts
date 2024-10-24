"use server";

import { TagSchema } from "@conquest/zod/tag.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateTagAction = authAction
  .metadata({ name: "updateTagAction" })
  .schema(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id, name, color } }) => {
    const workspace_id = ctx.user.workspace_id;

    const tag = await prisma.tag.update({
      where: {
        id,
        workspace_id,
      },
      data: {
        name,
        color,
      },
    });

    revalidatePath(`/${ctx.user.workspace.slug}/settings/tags`);
    return TagSchema.parse(tag);
  });

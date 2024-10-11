"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { TagSchema } from "@/schemas/tag.schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateTag = authAction
  .metadata({ name: "updateTag" })
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

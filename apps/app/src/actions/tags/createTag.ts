"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { TagSchema } from "@/schemas/tag.schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createTag = authAction
  .metadata({ name: "createTag" })
  .schema(z.object({ name: z.string(), color: z.string() }))
  .action(async ({ ctx, parsedInput: { name, color } }) => {
    const tag = await prisma.tag.create({
      data: {
        workspace_id: ctx.user.workspace_id,
        name,
        color,
      },
    });

    revalidatePath(`/${ctx.user.workspace.slug}/settings/tags`);
    return TagSchema.parse(tag);
  });

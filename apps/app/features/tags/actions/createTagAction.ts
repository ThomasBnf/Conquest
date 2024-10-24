"use server";

import { TagSchema } from "@conquest/zod/tag.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createTagAction = authAction
  .metadata({ name: "createTagAction" })
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

"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { WorkspaceSchema } from "schemas/workspace.schema";
import { z } from "zod";

export const updateWorkspace = authAction
  .metadata({ name: "updateWorkspace" })
  .schema(
    z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      guild_id: z.string().optional(),
      source: z
        .enum(["google", "twitter", "linkedin", "reddit", "youtube", "friend"])
        .optional(),
      company_size: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput: { name, slug, guild_id, source }, ctx }) => {
    const workspace = await prisma.workspace.update({
      where: {
        id: ctx.user?.workspace_id,
      },
      data: {
        name,
        slug,
        guild_id,
        source,
      },
    });

    revalidatePath("/");
    return WorkspaceSchema.parse(workspace);
  });

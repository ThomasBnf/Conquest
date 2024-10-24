"use server";

import { WorkspaceSchema } from "@conquest/zod/workspace.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateWorkspaceAction = authAction
  .metadata({ name: "updateWorkspaceAction" })
  .schema(
    z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      source: z
        .enum(["google", "twitter", "linkedin", "reddit", "youtube", "friend"])
        .optional(),
      company_size: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput: { name, slug, source }, ctx }) => {
    const workspace = await prisma.workspace.update({
      where: {
        id: ctx.user?.workspace_id,
      },
      data: {
        name,
        slug,
        source,
      },
    });

    revalidatePath("/");
    return WorkspaceSchema.parse(workspace);
  });

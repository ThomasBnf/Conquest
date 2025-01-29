"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@conquest/db/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const deleteWorkflow = authAction
  .metadata({
    name: "deleteWorkflow",
  })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    const slug = ctx.user.workspace.slug;
    await prisma.workflows.delete({
      where: {
        id,
        workspace_id: ctx.user.workspace_id,
      },
    });

    revalidatePath(`/${slug}/workflows`);
    redirect(`/${slug}/workflows`);
  });

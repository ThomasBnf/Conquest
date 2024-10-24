"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const deleteWorkflowAction = authAction
  .metadata({
    name: "deleteWorkflowAction",
  })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    await prisma.workflow.delete({
      where: {
        id,
        workspace_id: ctx.user.workspace_id,
      },
    });

    revalidatePath(`/w/${ctx.user.workspace.slug}/workflows`);
    redirect(`/w/${ctx.user.workspace.slug}/workflows`);
  });

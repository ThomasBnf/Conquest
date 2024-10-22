"use server";

import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const publishWorkflow = authAction
  .metadata({ name: "publishWorkflow" })
  .schema(
    z.object({
      id: z.string().cuid(),
      published: z.boolean().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id, published } }) => {
    const updatedWorkflow = await prisma.workflow.update({
      where: {
        id,
        workspace_id: ctx.user.workspace_id,
      },
      data: {
        published,
      },
    });

    revalidatePath(`/${ctx.user.workspace.slug}/workflows/${id}`);
    return WorkflowSchema.parse(updatedWorkflow);
  });

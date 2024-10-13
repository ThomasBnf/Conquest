"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { NodeRecurringSchema } from "schemas/node.schema";
import { WorkflowSchema } from "schemas/workflow.schema";
import { z } from "zod";

export const publishWorkflow = authAction
  .metadata({ name: "publishWorkflow" })
  .schema(
    z.object({
      id: z.string().cuid(),
      isPublished: z.boolean().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id, isPublished } }) => {
    const updatedWorkflow = await prisma.workflow.update({
      where: {
        id,
        workspace_id: ctx.user.workspace_id,
      },
      data: {
        isPublished,
      },
    });

    const parsedWorkflow = WorkflowSchema.parse(updatedWorkflow);

    const node = parsedWorkflow.nodes.find(
      (node) => node.data.type === "trigger-recurring-schedule",
    )?.data;

    const parsedNode = NodeRecurringSchema.parse(node);
    // const cron = cronBuilder(parsedNode);

    if (isPublished) {
    }

    revalidatePath(`/${ctx.user.workspace.slug}/workflows/${id}`);
    return WorkflowSchema.parse(updatedWorkflow);
  });

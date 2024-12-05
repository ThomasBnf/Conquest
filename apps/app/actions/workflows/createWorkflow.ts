"use server";

import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";

export const createWorkflow = authAction
  .metadata({
    name: "createWorkflow",
  })
  .action(async ({ ctx }) => {
    const workflow = await prisma.workflows.create({
      data: {
        workspace_id: ctx.user.workspace.id,
        name: "Untitled workflow",
        description: "",
        published: false,
        nodes: [],
        edges: [],
      },
    });

    revalidatePath(`/${ctx.user.workspace.slug}/workflows`);
    return WorkflowSchema.parse(workflow);
  });

"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { WorkflowSchema } from "@/schemas/workflow.schema";
import { revalidatePath } from "next/cache";

export const createWorkflow = authAction
  .metadata({
    name: "createWorkflow",
  })
  .action(async ({ ctx }) => {
    const workflow = await prisma.workflow.create({
      data: {
        workspace_id: ctx.user.workspace.id,
        icon: "Workflow",
        name: "Untitled workflow",
        description: "",
        isPublished: false,
        nodes: [],
        edges: [],
      },
    });

    revalidatePath(`/${ctx.user.workspace.slug}/workflows`);
    return WorkflowSchema.parse(workflow);
  });

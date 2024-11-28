"use server";

import { authAction } from "@/lib/authAction";
import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { prisma } from "lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

export const _getWorkflow = authAction
  .metadata({
    name: "_getWorkflow",
  })
  .schema(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    const workspace_id = ctx.user.workspace_id;

    const workflow = await prisma.workflows.findUnique({
      where: {
        id,
        workspace_id,
      },
    });

    if (!workflow) redirect("/workflows");

    return WorkflowSchema.parse(workflow);
  });

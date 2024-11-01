import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";

export const listWorkflows = authAction
  .metadata({
    name: "listWorkflows",
  })
  .action(async ({ ctx }) => {
    const workflows = await prisma.workflow.findMany({
      where: {
        workspace_id: ctx.user.workspace.id,
      },
    });

    return WorkflowSchema.array().parse(workflows);
  });

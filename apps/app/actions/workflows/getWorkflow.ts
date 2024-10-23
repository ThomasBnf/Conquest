import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const getWorkflow = authAction
  .metadata({
    name: "getWorkflow",
  })
  .schema(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    const workflow = await prisma.workflow.findUnique({
      where: {
        id,
        workspace_id: ctx.user.workspace.id,
      },
    });

    return WorkflowSchema.parse(workflow);
  });

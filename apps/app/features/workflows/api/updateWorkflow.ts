import { prisma } from "@conquest/db/prisma";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { protectedProcedure } from "@/server/trpc";

export const updateWorkflow = protectedProcedure
  .input(WorkflowSchema)
  .mutation(async ({ ctx: { user }, input: { id, ...data } }) => {
    const { workspaceId } = user;

    const workflow = await prisma.workflow.update({
      where: {
        id,
        workspaceId,
      },
      data,
    });

    return WorkflowSchema.parse(workflow);
  });

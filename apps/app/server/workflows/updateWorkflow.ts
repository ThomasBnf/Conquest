import { prisma } from "@conquest/db/prisma";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { protectedProcedure } from "../trpc";

export const updateWorkflow = protectedProcedure
  .input(
    WorkflowSchema.pick({
      id: true,
      name: true,
      description: true,
      published: true,
      nodes: true,
      edges: true,
    }).partial(),
  )
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

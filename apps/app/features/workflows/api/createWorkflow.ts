import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";

export const createWorkflow = protectedProcedure.mutation(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    const workflow = await prisma.workflow.create({
      data: {
        name: "New Workflow",
        description: "New Workflow Description",
        nodes: [],
        edges: [],
        workspaceId,
        createdBy: user.id,
      },
    });

    return WorkflowSchema.parse(workflow);
  },
);

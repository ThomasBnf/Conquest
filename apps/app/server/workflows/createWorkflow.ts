import { prisma } from "@conquest/db/prisma";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { protectedProcedure } from "../trpc";

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
      },
    });

    return WorkflowSchema.parse(workflow);
  },
);

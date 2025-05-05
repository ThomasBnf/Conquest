import { prisma } from "@conquest/db/prisma";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { protectedProcedure } from "../trpc";

export const listWorkflows = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    const workflows = await prisma.workflow.findMany({
      where: {
        workspaceId,
      },
    });

    return WorkflowSchema.array().parse(workflows);
  },
);

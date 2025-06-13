import { prisma } from "@conquest/db/prisma";
import { WorkflowItemSchema } from "@conquest/zod/schemas/workflow.schema";
import { protectedProcedure } from "@/server/trpc";

export const listWorkflows = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    const workflows = await prisma.workflow.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        _count: true,
        runs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    const sortedWorkflows = workflows.sort((a, b) => {
      if (a.archivedAt && !b.archivedAt) return 1;
      if (!a.archivedAt && b.archivedAt) return -1;
      return 0;
    });

    return WorkflowItemSchema.array().parse(sortedWorkflows);
  },
);

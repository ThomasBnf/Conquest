import { prisma } from "@conquest/db/prisma";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { z } from "zod";
import { protectedProcedure } from "@/server/trpc";

export const getWorkflow = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input: { id } }) => {
    const { workspaceId } = user;

    const workflow = await prisma.workflow.findUnique({
      where: {
        id,
        workspaceId,
      },
    });

    if (!workflow) return null;
    return WorkflowSchema.parse(workflow);
  });

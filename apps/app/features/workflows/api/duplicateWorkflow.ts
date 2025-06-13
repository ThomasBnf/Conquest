import { prisma } from "@conquest/db/prisma";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { protectedProcedure } from "@/server/trpc";

export const duplicateWorkflow = protectedProcedure
  .input(WorkflowSchema)
  .mutation(async ({ input }) => {
    const workflow = await prisma.workflow.create({
      data: input,
    });

    return WorkflowSchema.parse(workflow);
  });

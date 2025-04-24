import { prisma } from "@conquest/db/prisma";
import { deleteIntegration as _deleteIntegration } from "@conquest/trigger/tasks/deleteIntegration";
import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteIntegration = protectedProcedure
  .input(
    z.object({
      integration: IntegrationSchema,
    }),
  )
  .mutation(async ({ input }) => {
    const { integration } = input;

    await prisma.integration.delete({
      where: { id: integration.id },
    });

    await _deleteIntegration.trigger({ integration, deleteIntegration: false });
    return { success: true };
  });

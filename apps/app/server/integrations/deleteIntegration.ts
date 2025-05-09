import { prisma } from "@conquest/db/prisma";
import { generateJWT } from "@conquest/trigger/github/generateJWT";
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

    await prisma.integration.delete({ where: { id: integration.id } });

    let jwt = null;

    if (integration.details.source === "Github") {
      jwt = generateJWT();
    }

    await _deleteIntegration.trigger({ integration, jwt });

    return { success: true };
  });

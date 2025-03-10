import { deleteIntegration as _deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
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

    return await _deleteIntegration({ integration });
  });

import { prisma } from "@conquest/db/prisma";
import { generateJWT } from "@conquest/trigger/github/generateJWT";
import { deleteIntegration as _deleteIntegration } from "@conquest/trigger/tasks/deleteIntegration";
import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { sleep } from "@trpc/server/unstable-core-do-not-import";
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
    const isGithub = integration.details.source === "Github";

    let jwt = null;

    if (isGithub) {
      jwt = generateJWT();
    }

    await _deleteIntegration.trigger({ integration, jwt });

    if (isGithub) await sleep(3000);

    await prisma.integration.delete({ where: { id: integration.id } });

    return { success: true };
  });

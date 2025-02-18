import { prisma } from "@conquest/db/prisma";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getIntegrationBySource = protectedProcedure
  .input(
    z.object({
      source: SOURCE,
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { source } = input;

    const integration = await prisma.integration.findFirst({
      where: {
        details: {
          path: ["source"],
          equals: source,
        },
        workspace_id,
      },
    });

    if (!integration) return null;
    return IntegrationSchema.parse(integration);
  });

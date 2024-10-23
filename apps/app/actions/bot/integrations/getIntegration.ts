"use server";

import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { z } from "zod";

export const getIntegration = safeAction
  .metadata({ name: "getIntegration" })
  .schema(
    z.object({
      external_id: z.string(),
    }),
  )
  .action(async ({ parsedInput: { external_id } }) => {
    const integration = await prisma.integration.findUnique({
      where: {
        external_id,
      },
    });

    return IntegrationSchema.parse(integration);
  });

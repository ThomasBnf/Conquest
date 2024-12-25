import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { STATUS } from "@conquest/zod/enum/status.enum";
import {
  IntegrationDetailsSchema,
  IntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { z } from "zod";

export const updateIntegration = safeAction
  .metadata({
    name: "updateIntegration",
  })
  .schema(
    z.object({
      id: z.string(),
      installed_at: z.date().optional(),
      details: IntegrationDetailsSchema.optional(),
      status: STATUS.optional(),
    }),
  )
  .action(async ({ parsedInput: { id, installed_at, details, status } }) => {
    const integration = await prisma.integrations.update({
      where: {
        id,
      },
      data: {
        details,
        installed_at,
        status,
      },
    });

    return IntegrationSchema.parse(integration);
  });

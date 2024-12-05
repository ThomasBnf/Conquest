"use server";

import { STATUS } from "@conquest/zod/enum/status.enum";
import {
  IntegrationDetailsSchema,
  IntegrationSchema,
} from "@conquest/zod/integration.schema";
import { tasks } from "@trigger.dev/sdk/v3";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const upsertIntegration = authAction
  .metadata({ name: "upsertIntegration" })
  .schema(
    z.object({
      external_id: z.string().optional(),
      status: STATUS,
      details: IntegrationDetailsSchema,
    }),
  )
  .action(async ({ ctx, parsedInput: { external_id, status, details } }) => {
    const integration = await prisma.integrations.upsert({
      where: {
        external_id,
      },
      update: {
        external_id,
        details,
        installed_at: new Date(),
      },
      create: {
        external_id,
        status,
        details,
        workspace_id: ctx.user?.workspace_id,
      },
    });

    const parsedIntegration = IntegrationSchema.parse(integration);

    if (parsedIntegration.details.source === "DISCOURSE") {
      tasks.trigger("install-discourse", { integration: parsedIntegration });
    }

    return parsedIntegration;
  });

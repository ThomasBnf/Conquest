"use server";

import { IntegrationDetailsSchema } from "@conquest/zod/integration.schema";
import { STATUS } from "@conquest/zod/status.enum";
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
    return await prisma.integration.upsert({
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
  });

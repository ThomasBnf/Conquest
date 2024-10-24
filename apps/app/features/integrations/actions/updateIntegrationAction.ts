"use server";

import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateIntegrationAction = authAction
  .metadata({ name: "updateIntegrationAction" })
  .schema(
    z.object({
      id: z.string(),
      installed_at: z.date().nullable().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id, installed_at } }) => {
    const slug = ctx.user?.workspace.slug;

    const integration = await prisma.integration.update({
      where: {
        id,
        workspace_id: ctx.user?.workspace_id,
      },
      data: {
        installed_at,
      },
    });

    revalidatePath(`/w/${slug}/settings/integrations`);
    return IntegrationSchema.parse(integration);
  });

"use server";

import { authAction } from "@/lib/authAction";
import { createIntegration as _createIntegration } from "@/queries/integrations/createIntegration";
import {
  IntegrationDetailsSchema,
  IntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createIntegration = authAction
  .metadata({
    name: "createIntegration",
  })
  .schema(
    z.object({
      external_id: z.string().nullable(),
      details: IntegrationDetailsSchema,
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { external_id, details } }) => {
    const workspace_id = user.workspace_id;
    const slug = user.workspace.slug;

    const integraiton = await _createIntegration({
      external_id,
      details,
      workspace_id,
      created_by: user.id,
    });

    revalidatePath(`/${slug}/settings/integrations`);
    return IntegrationSchema.parse(integraiton);
  });

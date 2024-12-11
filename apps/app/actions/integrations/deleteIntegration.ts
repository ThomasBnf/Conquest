"use server";

import { authAction } from "@/lib/authAction";
import { deleteIntegration as _deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { slug } from "cuid";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const deleteIntegration = authAction
  .metadata({
    name: "deleteIntegration",
  })
  .schema(
    z.object({
      source: SOURCE,
      integration: IntegrationSchema,
    }),
  )
  .action(async ({ parsedInput: { source, integration } }) => {
    await _deleteIntegration({ source, integration });

    return revalidatePath(`/${slug}/settings/integrations`);
  });

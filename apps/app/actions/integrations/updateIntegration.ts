"use server";

import { authAction } from "@/lib/authAction";
import { updateIntegration as _updateIntegration } from "@/queries/integrations/updateIntegration";
import { STATUS } from "@conquest/zod/enum/status.enum";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateIntegration = authAction
  .metadata({
    name: "updateIntegration",
  })
  .schema(
    z.object({
      id: z.string(),
      status: STATUS,
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { id, status } }) => {
    const { slug } = user.workspace;

    const integration = await _updateIntegration({
      id,
      status,
    });

    const source = integration.details.source.toLowerCase();

    revalidatePath(`/${slug}/settings/integrations/${source}`);
  });

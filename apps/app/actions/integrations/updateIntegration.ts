"use server";

import { authAction } from "@/lib/authAction";
import { updateIntegration as _updateIntegration } from "@conquest/db/queries/integrations/updateIntegration";
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
      external_id: z.string().optional(),
      details: z.any().optional(),
      status: STATUS,
      connected_at: z.date().optional(),
      created_by: z.string().optional(),
    }),
  )
  .action(
    async ({
      ctx: { user },
      parsedInput: {
        id,
        status,
        external_id,
        details,
        connected_at,
        created_by,
      },
    }) => {
      const { slug } = user.workspace;

      const integration = await _updateIntegration({
        id,
        external_id,
        details,
        status,
        connected_at,
        created_by,
      });

      const source = integration.details.source.toLowerCase();

      revalidatePath(`/${slug}/settings/integrations/${source}`);
    },
  );

"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { revalidatePath } from "next/cache";
import { FormPointConfigSchema } from "../schemas/form-point-config";

export const updateIntegration = authAction
  .metadata({
    name: "updateIntegration",
  })
  .schema(
    FormPointConfigSchema.extend({
      integration: IntegrationSchema,
    }),
  )
  .action(
    async ({
      ctx,
      parsedInput: { integration, post, reply, reaction, invitation },
    }) => {
      const slug = ctx.user.workspace.slug;

      const updatedIntegration = await prisma.integrations.update({
        where: { id: integration.id },
        data: {
          details: {
            ...integration.details,
            points_config: {
              post,
              reply,
              reaction,
              invitation,
            },
          },
        },
      });

      revalidatePath(`/${slug}/settings/integrations`);
      return IntegrationSchema.parse(updatedIntegration);
    },
  );

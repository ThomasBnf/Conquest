import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { SOURCE } from "@conquest/zod/source.enum";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const createIntegration = authAction
  .metadata({ name: "createIntegration" })
  .schema(
    z.object({
      external_id: z.string(),
      name: z.string(),
      source: SOURCE,
      token: z.string(),
      scopes: z.string(),
    }),
  )
  .action(
    async ({
      ctx,
      parsedInput: { external_id, name, source, token, scopes },
    }) => {
      const integration = await prisma.integration.create({
        data: {
          external_id,
          name,
          source,
          token,
          scopes,
          status: "CONNECTED",
          workspace_id: ctx.user?.workspace_id,
        },
      });

      return IntegrationSchema.parse(integration);
    },
  );

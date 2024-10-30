"use server";

import { STATUS } from "@conquest/zod/integration.schema";
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
      status: STATUS,
      scopes: z.string(),
    }),
  )
  .action(
    async ({
      ctx,
      parsedInput: { external_id, name, source, token, status, scopes },
    }) => {
      return await prisma.integration.create({
        data: {
          external_id,
          name,
          source,
          token,
          scopes,
          status,
          workspace_id: ctx.user?.workspace_id,
        },
      });
    },
  );

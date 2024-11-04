"use server";

import { STATUS } from "@conquest/zod/integration.schema";
import { SOURCE } from "@conquest/zod/source.enum";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const upsertIntegration = authAction
  .metadata({ name: "upsertIntegration" })
  .schema(
    z.object({
      external_id: z.string(),
      name: z.string(),
      source: SOURCE,
      token: z.string(),
      slack_user_token: z.string().nullable(),
      status: STATUS,
      scopes: z.string(),
    }),
  )
  .action(
    async ({
      ctx,
      parsedInput: {
        external_id,
        name,
        source,
        token,
        slack_user_token,
        status,
        scopes,
      },
    }) => {
      return await prisma.integration.upsert({
        where: {
          external_id,
        },
        update: {
          external_id,
          name,
          source,
          scopes,
          token,
          slack_user_token,
          status,
          installed_at: new Date(),
        },
        create: {
          external_id,
          name,
          source,
          token,
          slack_user_token,
          scopes,
          status,
          workspace_id: ctx.user?.workspace_id,
        },
      });
    },
  );

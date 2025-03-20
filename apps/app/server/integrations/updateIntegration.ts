import { updateIntegration as _updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { prisma } from "@conquest/db/prisma";
import { encrypt } from "@conquest/db/utils/encrypt";
import { STATUS } from "@conquest/zod/enum/status.enum";
import { IntegrationDetailsSchema } from "@conquest/zod/schemas/integration.schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateIntegration = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      external_id: z.string().optional(),
      connected_at: z.date().optional(),
      details: IntegrationDetailsSchema.optional(),
      status: STATUS.optional(),
      trigger_token: z.string().optional(),
      expires_at: z.date().optional(),
      created_by: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;

    const {
      id,
      external_id,
      connected_at,
      details,
      status,
      trigger_token,
      expires_at,
      created_by,
    } = input;

    if (details?.source === "Discourse") {
      const { api_key } = details;

      const encryptedApiKey = await encrypt(api_key);

      details.api_key = encryptedApiKey.token;
      details.api_key_iv = encryptedApiKey.iv;
    }

    if (details?.source === "Github") {
      const { repo } = details;

      console.log(repo);

      const github = await prisma.integration.findFirst({
        where: {
          details: {
            path: ["repo"],
            equals: repo,
          },
        },
      });

      if (github) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This repository is already connected to another workspace",
        });
      }
    }

    return await _updateIntegration({
      id,
      external_id,
      connected_at,
      details,
      status,
      trigger_token,
      expires_at,
      created_by,
      workspace_id,
    });
  });

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
      externalId: z.string().optional(),
      connectedAt: z.date().optional(),
      details: IntegrationDetailsSchema.optional(),
      status: STATUS.optional(),
      triggerToken: z.string().optional(),
      expiresAt: z.date().optional(),
      createdBy: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;

    const {
      id,
      externalId,
      connectedAt,
      details,
      status,
      triggerToken,
      expiresAt,
      createdBy,
    } = input;

    if (details?.source === "Discourse") {
      const { apiKey } = details;

      const encryptedApiKey = await encrypt(apiKey);

      details.apiKey = encryptedApiKey.token;
      details.apiKeyIv = encryptedApiKey.iv;
    }

    if (details?.source === "Github") {
      const { repo } = details;

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
      externalId,
      connectedAt,
      details,
      status,
      triggerToken,
      expiresAt,
      createdBy,
      workspaceId,
    });
  });

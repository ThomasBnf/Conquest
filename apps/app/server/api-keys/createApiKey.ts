import { FormCreateSchema } from "@/features/api-keys/schema/form-create.schema";
import { prisma } from "@conquest/db/prisma";
import { APIKeySchema } from "@conquest/zod/schemas/apikey.schema";
import cuid from "cuid";
import { protectedProcedure } from "../trpc";

export const createApiKey = protectedProcedure
  .input(FormCreateSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { name } = input;
    const { workspace_id } = user;

    const apiKey = await prisma.api_key.create({
      data: {
        name,
        token: cuid(),
        workspace_id,
      },
    });

    return APIKeySchema.parse(apiKey);
  });

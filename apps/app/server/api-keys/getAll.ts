import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { APIKeySchema } from "@conquest/zod/schemas/apikey.schema";

export const getAll = protectedProcedure.query(async ({ ctx: { user } }) => {
  const { workspace_id } = user;

  const apiKeys = await prisma.api_key.findMany({
    where: {
      workspace_id,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return APIKeySchema.array().parse(apiKeys);
});

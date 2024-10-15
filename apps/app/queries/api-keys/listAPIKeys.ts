import { APIKeySchema } from "@conquest/zod/apikey.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";

export const listAPIKeys = authAction
  .metadata({ name: "listAPIKeys" })
  .action(async ({ ctx }) => {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        user_id: ctx.user.id,
      },
    });
    return APIKeySchema.array().parse(apiKeys);
  });

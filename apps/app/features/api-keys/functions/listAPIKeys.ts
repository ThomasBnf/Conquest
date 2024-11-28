import { APIKeySchema } from "@conquest/zod/apikey.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";

export const listAPIKeys = authAction
  .metadata({
    name: "listAPIKeys",
  })
  .action(async ({ ctx }) => {
    const workspace_id = ctx.user.workspace_id;

    const apiKeys = await prisma.apikeys.findMany({
      where: {
        workspace_id,
      },
    });
    return APIKeySchema.array().parse(apiKeys);
  });

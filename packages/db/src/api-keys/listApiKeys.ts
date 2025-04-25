import { APIKeySchema } from "@conquest/zod/schemas/apikey.schema";
import { prisma } from "../prisma";

type Props = {
  workspaceId: string;
};

export const listApiKeys = async ({ workspaceId }: Props) => {
  const apiKeys = await prisma.apiKey.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return APIKeySchema.array().parse(apiKeys);
};

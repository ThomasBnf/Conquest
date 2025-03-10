import { APIKeySchema } from "@conquest/zod/schemas/apikey.schema";
import { prisma } from "../prisma";

type Props = {
  workspace_id: string;
};

export const listApiKeys = async ({ workspace_id }: Props) => {
  const apiKeys = await prisma.api_key.findMany({
    where: {
      workspace_id,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return APIKeySchema.array().parse(apiKeys);
};

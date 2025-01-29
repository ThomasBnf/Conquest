import { APIKeySchema } from "@conquest/zod/schemas/apikey.schema";
import { prisma } from "../../prisma";

type Props = {
  workspace_id: string;
};

export const listAPIKeys = async ({ workspace_id }: Props) => {
  const apiKeys = await prisma.apikeys.findMany({
    where: {
      workspace_id,
    },
  });

  return APIKeySchema.array().parse(apiKeys);
};

import { APIKeySchema } from "@conquest/zod/schemas/apikey.schema";
import { randomUUID } from "node:crypto";
import { prisma } from "../prisma";

type Props = {
  name: string;
  workspaceId: string;
};

export const createApiKey = async ({ name, workspaceId }: Props) => {
  const apiKey = await prisma.api_key.create({
    data: {
      name,
      token: randomUUID(),
      workspaceId,
    },
  });

  return APIKeySchema.parse(apiKey);
};

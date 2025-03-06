import { APIKeySchema } from "@conquest/zod/schemas/apikey.schema";
import { randomUUID } from "node:crypto";
import { prisma } from "../prisma";

type Props = {
  name: string;
  workspace_id: string;
};

export const createApiKey = async ({ name, workspace_id }: Props) => {
  const apiKey = await prisma.api_key.create({
    data: {
      name,
      token: randomUUID(),
      workspace_id,
    },
  });

  return APIKeySchema.parse(apiKey);
};

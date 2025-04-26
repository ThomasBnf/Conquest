import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { prisma } from "../prisma";

type Props = {
  externalId: string | null | undefined;
  workspaceId?: string;
};

export const getIntegration = async ({ externalId, workspaceId }: Props) => {
  if (!externalId) return null;

  const integration = await prisma.integration.findUnique({
    where: {
      externalId,
      workspaceId,
    },
  });

  console.log("integration", integration);

  if (!integration) return null;
  return IntegrationSchema.parse(integration);
};

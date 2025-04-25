import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { prisma } from "../prisma";

type Props = {
  workspaceId: string;
};

export const listIntegrations = async ({ workspaceId }: Props) => {
  const integrations = await prisma.integration.findMany({
    where: { workspaceId },
  });

  const parsedIntegrations = IntegrationSchema.array().parse(integrations);

  const sortedIntegrations = parsedIntegrations.sort((a, b) => {
    return a.details.source.localeCompare(b.details.source);
  });

  return sortedIntegrations;
};

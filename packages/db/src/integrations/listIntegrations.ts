import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { prisma } from "../prisma";

type Props = {
  workspace_id: string;
};

export const listIntegrations = async ({ workspace_id }: Props) => {
  const integrations = await prisma.integration.findMany({
    where: { workspace_id },
  });

  const parsedIntegrations = IntegrationSchema.array().parse(integrations);

  const sortedIntegrations = parsedIntegrations.sort((a, b) => {
    return a.details.source.localeCompare(b.details.source);
  });

  return sortedIntegrations;
};

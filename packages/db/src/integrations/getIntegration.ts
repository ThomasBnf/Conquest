import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { prisma } from "../prisma";

type Props = {
  external_id: string | null | undefined;
  workspace_id?: string;
};

export const getIntegration = async ({ external_id, workspace_id }: Props) => {
  if (!external_id) return undefined;

  const integration = await prisma.integration.findUnique({
    where: {
      external_id,
      workspace_id,
    },
  });

  if (!integration) return undefined;
  return IntegrationSchema.parse(integration);
};

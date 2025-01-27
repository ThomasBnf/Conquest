import { prisma } from "../../lib/prisma";
import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";

type Props = {
  external_id: string;
};

export const getIntegration = async ({ external_id }: Props) => {
  const integration = await prisma.integrations.findUnique({
    where: {
      external_id,
    },
  });

  if (!integration) return null;

  return IntegrationSchema.parse(integration);
};

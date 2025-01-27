import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { prisma } from "../../lib/prisma";

type Props = {
  external_id: string;
  status?: "CONNECTED";
};

export const getIntegration = async ({ external_id, status }: Props) => {
  const integration = await prisma.integrations.findUnique({
    where: {
      external_id,
      status,
    },
  });

  if (!integration) return null;

  return IntegrationSchema.parse(integration);
};

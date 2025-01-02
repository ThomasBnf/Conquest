import { prisma } from "@/lib/prisma";
import type { Status } from "@conquest/zod/enum/status.enum";
import {
  type IntegrationDetails,
  IntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";

type Props = {
  id: string;
  connected_at?: Date;
  details?: IntegrationDetails;
  status?: Status;
};

export const updateIntegration = async ({
  id,
  connected_at,
  details,
  status,
}: Props) => {
  const integration = await prisma.integrations.update({
    where: {
      id,
    },
    data: {
      details,
      connected_at,
      status,
    },
  });

  return IntegrationSchema.parse(integration);
};

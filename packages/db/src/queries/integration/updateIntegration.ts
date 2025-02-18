import type { Status } from "@conquest/zod/enum/status.enum";
import {
  type IntegrationDetails,
  IntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { prisma } from "../../prisma";

type Props = {
  id: string;
  external_id?: string;
  connected_at?: Date;
  details?: IntegrationDetails;
  status?: Status;
  created_by?: string;
};

export const updateIntegration = async ({
  id,
  external_id,
  connected_at,
  details,
  status,
  created_by,
}: Props) => {
  const integration = await prisma.integration.update({
    where: {
      id,
    },
    data: {
      external_id,
      details,
      connected_at,
      status,
      created_by,
    },
  });

  return IntegrationSchema.parse(integration);
};

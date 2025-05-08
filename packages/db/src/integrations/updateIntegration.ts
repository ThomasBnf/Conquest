import type { Status } from "@conquest/zod/enum/status.enum";
import {
  type IntegrationDetails,
  IntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { prisma } from "../prisma";

type Props = {
  id: string;
  externalId?: string;
  details?: IntegrationDetails;
  connectedAt?: Date;
  status?: Status;
  triggerToken?: string;
  expiresAt?: Date;
  createdBy?: string;
  workspaceId: string;
};

export const updateIntegration = async ({
  id,
  externalId,
  details,
  connectedAt,
  status,
  createdBy,
  workspaceId,
}: Props) => {
  const integration = await prisma.integration.update({
    where: {
      id,
      workspaceId,
    },
    data: {
      externalId,
      connectedAt,
      details,
      status,
      createdBy,
    },
  });

  return IntegrationSchema.parse(integration);
};

import type { Status } from "@conquest/zod/enum/status.enum";
import type { IntegrationDetails } from "@conquest/zod/schemas/integration.schema";
import { prisma } from "../prisma";

type Props = {
  id: string;
  external_id?: string;
  details?: IntegrationDetails;
  connected_at?: Date;
  status?: Status;
  trigger_token?: string;
  expires_at?: Date;
  created_by?: string;
  workspace_id: string;
};

export const updateIntegration = async ({
  id,
  external_id,
  details,
  connected_at,
  status,
  created_by,
  workspace_id,
}: Props) => {
  return await prisma.integration.update({
    where: {
      id,
      workspace_id,
    },
    data: {
      external_id,
      connected_at,
      details,
      status,
      created_by,
    },
  });
};

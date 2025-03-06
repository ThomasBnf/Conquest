import type { IntegrationDetails } from "@conquest/zod/schemas/integration.schema";
import { auth } from "@trigger.dev/sdk/v3";
import { addDays } from "date-fns";
import { prisma } from "../prisma";
import { getIntegration } from "./getIntegration";
import { updateIntegration } from "./updateIntegration";

type Props = {
  external_id: string | null;
  details: IntegrationDetails;
  created_by: string;
  workspace_id: string;
};

export const createIntegration = async ({
  external_id,
  details,
  created_by,
  workspace_id,
}: Props) => {
  const integration = await getIntegration({ external_id });

  if (!integration) {
    const expiresAt = addDays(new Date(), 30);
    const source = details.source.toLowerCase();

    const triggerToken = await auth.createTriggerPublicToken(
      `install-${source.toLowerCase()}`,
      { expirationTime: expiresAt },
    );

    return prisma.integration.create({
      data: {
        external_id,
        details,
        trigger_token: triggerToken,
        expires_at: expiresAt,
        status: "ENABLED",
        created_by,
        workspace_id,
      },
    });
  }

  const now = new Date();
  const isExpired = new Date(integration.expires_at) < now;

  if (isExpired) {
    const expiresAt = addDays(new Date(), 30);
    const source = details.source.toLowerCase();

    const triggerToken = await auth.createTriggerPublicToken(
      `install-${source.toLowerCase()}`,
      { expirationTime: expiresAt },
    );

    return await updateIntegration({
      id: integration.id,
      trigger_token: triggerToken,
      expires_at: expiresAt,
      workspace_id,
    });
  }
};

import type { IntegrationDetails } from "@conquest/zod/schemas/integration.schema";
import { auth } from "@trigger.dev/sdk/v3";
import { addDays } from "date-fns";
import { prisma } from "../prisma";
import { getIntegration } from "./getIntegration";
import { updateIntegration } from "./updateIntegration";

type Props = {
  externalId: string | null;
  details: IntegrationDetails;
  createdBy: string;
  workspaceId: string;
};

export const createIntegration = async ({
  externalId,
  details,
  createdBy,
  workspaceId,
}: Props) => {
  const integration = await getIntegration({ externalId });

  if (!integration) {
    const expiresAt = addDays(new Date(), 30);
    const source = details.source.toLowerCase();

    const triggerToken = await auth.createTriggerPublicToken(
      `install-${source.toLowerCase()}`,
      { expirationTime: expiresAt, multipleUse: true },
    );

    return prisma.integration.create({
      data: {
        externalId,
        details,
        triggerToken,
        expiresAt,
        status: "ENABLED",
        createdBy,
        workspaceId,
      },
    });
  }

  const now = new Date();
  const isExpired = new Date(integration.expiresAt) < now;

  if (isExpired) {
    const expiresAt = addDays(new Date(), 30);
    const source = details.source.toLowerCase();

    const triggerToken = await auth.createTriggerPublicToken(
      `install-${source.toLowerCase()}`,
      { expirationTime: expiresAt },
    );

    return await updateIntegration({
      id: integration.id,
      triggerToken,
      expiresAt,
      workspaceId,
    });
  }
};

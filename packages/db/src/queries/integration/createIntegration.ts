import {
  type IntegrationDetails,
  IntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { auth } from "@trigger.dev/sdk/v3";
import { addDays } from "date-fns";
import { prisma } from "../../prisma";

type Props = {
  external_id: string | null;
  workspace_id: string;
  details: IntegrationDetails;
  created_by: string;
};

export const createIntegration = async ({
  external_id,
  workspace_id,
  details,
  created_by,
}: Props) => {
  const integrationExist = await prisma.integration.findFirst({
    where: {
      OR: [
        {
          details: {
            path: ["source"],
            equals: details.source,
          },
          workspace_id,
        },
        ...(external_id ? [{ external_id }] : []),
      ],
    },
  });

  if (!integrationExist) {
    const expiresAt = addDays(new Date(), 30);
    const source = details.source.toLowerCase();

    const triggerToken = await auth.createTriggerPublicToken(
      `install-${source}`,
      { expirationTime: expiresAt },
    );

    const integration = await prisma.integration.create({
      data: {
        external_id,
        status: "ENABLED",
        details,
        trigger_token: triggerToken,
        expires_at: expiresAt,
        created_by,
        workspace_id,
      },
    });

    return IntegrationSchema.parse(integration);
  }

  const now = new Date();

  if (integrationExist.expires_at < now) {
    const expiresAt = addDays(new Date(), 30);
    const source = details.source.toLowerCase();

    const triggerToken = await auth.createTriggerPublicToken(
      `install-${source}`,
      { expirationTime: expiresAt },
    );

    const updatedIntegration = await prisma.integration.update({
      where: { id: integrationExist.id },
      data: {
        external_id,
        details,
        trigger_token: triggerToken,
        expires_at: expiresAt,
      },
    });

    return IntegrationSchema.parse(updatedIntegration);
  }

  return IntegrationSchema.parse(integrationExist);
};

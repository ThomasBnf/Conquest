import {
  type IntegrationDetails,
  IntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { auth } from "@trigger.dev/sdk/v3";
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
  const integrationExist = await prisma.integrations.findFirst({
    where: {
      details: {
        path: ["source"],
        equals: details.source,
      },
      workspace_id,
    },
  });

  if (integrationExist) {
    const now = new Date();

    if (integrationExist.trigger_token_expires_at < now) {
      const source = details.source.toLowerCase();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

      const triggerToken = await auth.createTriggerPublicToken(
        `install-${source}`,
        { expirationTime: expiresAt },
      );

      const updatedIntegration = await prisma.integrations.update({
        where: { id: integrationExist.id },
        data: {
          trigger_token: triggerToken,
          trigger_token_expires_at: expiresAt,
        },
      });

      return IntegrationSchema.parse(updatedIntegration);
    }
  }

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  const triggerToken = await auth.createTriggerPublicToken(
    `install-${details.source.toLowerCase()}`,
  );

  const integration = await prisma.integrations.create({
    data: {
      external_id,
      status: "ENABLED",
      details,
      trigger_token: triggerToken,
      trigger_token_expires_at: expiresAt,
      created_by,
      workspace_id,
    },
  });

  return IntegrationSchema.parse(integration);
};

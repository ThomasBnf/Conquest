import { CustomError } from "@/lib/safeAction";
import {
  type IntegrationDetails,
  IntegrationSchema,
} from "@conquest/zod/integration.schema";
import { auth } from "@trigger.dev/sdk/v3";
import { prisma } from "lib/prisma";

type Props = {
  external_id: string | null;
  workspace_id: string;
  details: IntegrationDetails;
};

export const createIntegration = async ({
  external_id,
  workspace_id,
  details,
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
        {
          expirationTime: expiresAt,
        },
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

    switch (details.source) {
      case "DISCOURSE":
        return new CustomError("Discourse workspace already connected", 400);
      case "SLACK":
        return new CustomError("Slack workspace already connected", 400);
      case "LIVESTORM":
        return new CustomError("Livestorm workspace already connected", 400);
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
      workspace_id,
      trigger_token: triggerToken,
      trigger_token_expires_at: expiresAt,
    },
  });

  return IntegrationSchema.parse(integration);
};

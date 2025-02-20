import { env } from "@conquest/env";
import {
  type Integration,
  LinkedInIntegrationSchema,
  LivestormIntegrationSchema,
  SlackIntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { decrypt } from "../../lib/decrypt";
import type { SOURCE } from "../../prisma";
import { prisma } from "../../prisma";
import { listSubscriptions } from "../linkedin/listSubscriptions";
import { removeWebhook } from "../linkedin/removeWebhook";
import { deleteWebhook } from "../livestorm/deleteWebhhok";
import { listWebhooks } from "../livestorm/listWebhooks";

type Props = {
  source: SOURCE;
  integration: Integration;
};

export const deleteIntegration = async ({ source, integration }: Props) => {
  const { workspace_id } = integration;

  if (source === "LIVESTORM") {
    const livestorm = LivestormIntegrationSchema.parse(integration);
    const { access_token, access_token_iv } = livestorm.details;

    const decryptedAccessToken = await decrypt({
      access_token: access_token,
      iv: access_token_iv,
    });

    await prisma.event.deleteMany({
      where: { source: "LIVESTORM", workspace_id },
    });

    const webhooks = await listWebhooks({ accessToken: decryptedAccessToken });

    for (const webhook of webhooks) {
      await deleteWebhook({
        accessToken: decryptedAccessToken,
        id: webhook.id,
      });
    }
  }

  if (source === "SLACK") {
    const slack = SlackIntegrationSchema.parse(integration);
    const web = new WebClient(slack.details.access_token);

    await web.apps.uninstall({
      token: slack.details.user_token,
      client_id: env.NEXT_PUBLIC_SLACK_CLIENT_ID,
      client_secret: env.SLACK_CLIENT_SECRET,
    });
  }

  if (source === "LINKEDIN") {
    const linkedin = LinkedInIntegrationSchema.parse(integration);

    await prisma.post.deleteMany({ where: { workspace_id } });

    const { subscriptions } = await listSubscriptions({ linkedin });

    if (subscriptions.elements.length > 0) {
      await removeWebhook({ linkedin });
    }
  }

  if (source === "DISCORD") {
    await prisma.event.deleteMany({
      where: { source: "DISCORD", workspace_id },
    });
  }

  await Promise.all([
    prisma.activity_type.deleteMany({ where: { source, workspace_id } }),
    prisma.channel.deleteMany({ where: { source, workspace_id } }),
    prisma.tag.deleteMany({ where: { source, workspace_id } }),
    prisma.company.deleteMany({ where: { source, workspace_id } }),
  ]);

  await prisma.member.deleteMany({ where: { source, workspace_id } });
  await prisma.integration.delete({ where: { id: integration.id } });

  return { success: true };
};

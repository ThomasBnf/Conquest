import { env } from "@conquest/env";
import {
  type Integration,
  LinkedInIntegrationSchema,
  LivestormIntegrationSchema,
  SlackIntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
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
    const { access_token } = livestorm.details;

    await prisma.events.deleteMany({
      where: { source: "LIVESTORM", workspace_id },
    });

    const webhooks = await listWebhooks({ accessToken: access_token });

    for (const webhook of webhooks) {
      await deleteWebhook({ accessToken: access_token, id: webhook.id });
    }
  }

  if (source === "SLACK") {
    const slack = SlackIntegrationSchema.parse(integration);
    const web = new WebClient(slack.details.token);

    await web.apps.uninstall({
      token: slack.details.token,
      client_id: env.NEXT_PUBLIC_SLACK_CLIENT_ID,
      client_secret: env.SLACK_CLIENT_SECRET,
    });
  }

  if (source === "LINKEDIN") {
    const linkedin = LinkedInIntegrationSchema.parse(integration);

    await prisma.posts.deleteMany({ where: { workspace_id } });

    const { subscriptions } = await listSubscriptions({ linkedin });

    if (subscriptions.elements.length > 0) {
      await removeWebhook({ linkedin });
    }
  }

  if (source === "DISCORD") {
    await prisma.events.deleteMany({
      where: { source: "DISCORD", workspace_id },
    });
  }

  await Promise.all([
    prisma.activities_types.deleteMany({ where: { source, workspace_id } }),
    prisma.channels.deleteMany({ where: { source, workspace_id } }),
    prisma.tags.deleteMany({ where: { source, workspace_id } }),
    prisma.companies.deleteMany({ where: { source, workspace_id } }),
  ]);

  await prisma.members.deleteMany({ where: { source, workspace_id } });
  await prisma.integrations.delete({ where: { id: integration.id } });

  return { success: true };
};

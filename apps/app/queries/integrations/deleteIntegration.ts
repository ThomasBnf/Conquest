import { prisma } from "@/lib/prisma";
import { calculateMembersLevel } from "@/trigger/calculateMembersLevel";
import type { SOURCE } from "@conquest/database";
import {
  type Integration,
  LinkedInIntegrationSchema,
  LivestormIntegrationSchema,
  SlackIntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { unsubscribeWebhook } from "../linkedin/unsubscribeWebhook";
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
      client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
    });
  }

  if (source === "LINKEDIN") {
    const linkedin = LinkedInIntegrationSchema.parse(integration);

    await prisma.posts.deleteMany({ where: { workspace_id } });
    await unsubscribeWebhook({ linkedin });
  }

  await prisma.$transaction(async (tx) => {
    await tx.integrations.delete({ where: { id: integration.id } });
    await tx.activities_types.deleteMany({ where: { source, workspace_id } });
    await tx.channels.deleteMany({ where: { source, workspace_id } });
    await tx.tags.deleteMany({ where: { source, workspace_id } });
    await tx.members.deleteMany({ where: { source, workspace_id } });
    await tx.companies.deleteMany({ where: { source, workspace_id } });
  });

  calculateMembersLevel.trigger({ workspace_id });

  return { success: true };
};

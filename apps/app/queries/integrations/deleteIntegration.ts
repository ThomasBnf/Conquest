import { prisma } from "@/lib/prisma";
import { calculateMembersLevel } from "@/trigger/calculateMembersLevel";
import type { SOURCE } from "@conquest/database";
import {
  type Integration,
  LivestormIntegrationSchema,
  SlackIntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
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

  await Promise.all([
    prisma.integrations.delete({ where: { id: integration.id } }),
    prisma.activities_types.deleteMany({ where: { source, workspace_id } }),
    prisma.channels.deleteMany({ where: { source, workspace_id } }),
    prisma.tags.deleteMany({ where: { source, workspace_id } }),
    prisma.members.deleteMany({ where: { source, workspace_id } }),
    prisma.companies.deleteMany({ where: { source, workspace_id } }),
  ]);

  calculateMembersLevel.trigger({ workspace_id });

  return { success: true };
};

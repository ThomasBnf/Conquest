import { prisma } from "@/lib/prisma";
import { calculateMembersLevel } from "@/trigger/calculateMembersLevel.trigger";
import type { SOURCE } from "@conquest/database";
import {
  type Integration,
  LinkedInIntegrationSchema,
  LivestormIntegrationSchema,
  SlackIntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
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
      client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
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

  try {
    await prisma.$transaction(async (tx) => {
      const queries = [
        {
          name: "integrations",
          action: () =>
            tx.integrations.delete({ where: { id: integration.id } }),
        },
        {
          name: "activities_types",
          action: () =>
            tx.activities_types.deleteMany({ where: { source, workspace_id } }),
        },
        {
          name: "channels",
          action: () =>
            tx.channels.deleteMany({ where: { source, workspace_id } }),
        },
        {
          name: "tags",
          action: () => tx.tags.deleteMany({ where: { source, workspace_id } }),
        },
        {
          name: "members",
          action: () =>
            tx.members.deleteMany({ where: { source, workspace_id } }),
        },
        {
          name: "companies",
          action: () =>
            tx.companies.deleteMany({ where: { source, workspace_id } }),
        },
      ];

      for (const query of queries) {
        try {
          await query.action();
        } catch (error) {
          console.error(`Error in ${query.name} deletion:`, error);
          throw new Error(
            `Failed to delete ${query.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Transaction failed",
    };
  }
  calculateMembersLevel.trigger({ workspace_id });

  return { success: true };
};

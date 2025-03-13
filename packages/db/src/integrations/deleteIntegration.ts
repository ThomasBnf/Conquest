import { client } from "@conquest/clickhouse/client";
import { env } from "@conquest/env";
import {
  type Integration,
  LinkedInIntegrationSchema,
  LivestormIntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { deleteManyEvents } from "../events/deleteManyEvents";
import { listSubscriptions } from "../linkedin/listSubscriptions";
import { removeWebhook } from "../linkedin/removeWebhook";
import { deleteWebhook } from "../livestorm/deleteWebhook";
import { getRefreshToken } from "../livestorm/getRefreshToken";
import { listWebhooks } from "../livestorm/listWebhooks";
import { deleteManyPosts } from "../posts/deleteManyPosts";
import { prisma } from "../prisma";
import { decrypt } from "../utils/decrypt";

type Props = {
  integration: Integration;
};

export const deleteIntegration = async ({ integration }: Props) => {
  const { workspace_id, details } = integration;
  const { source } = details;

  if (source === "Livestorm") {
    const livestorm = LivestormIntegrationSchema.parse(integration);

    const accessToken = await getRefreshToken({ livestorm });

    await deleteManyEvents({ source });

    const webhooks = await listWebhooks({ accessToken });

    for (const webhook of webhooks) {
      await deleteWebhook({ accessToken, id: webhook.id });
    }
  }

  if (source === "Slack") {
    const { access_token, access_token_iv } = details;

    const token = await decrypt({
      access_token,
      iv: access_token_iv,
    });

    const web = new WebClient(token);

    await web.apps.uninstall({
      token,
      client_id: env.NEXT_PUBLIC_SLACK_CLIENT_ID,
      client_secret: env.SLACK_CLIENT_SECRET,
    });
  }

  if (source === "Linkedin") {
    const linkedin = LinkedInIntegrationSchema.parse(integration);

    await deleteManyPosts({ workspace_id });

    const { subscriptions } = await listSubscriptions({ linkedin });

    if (subscriptions.elements.length > 0) {
      await removeWebhook({ linkedin });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.tag.deleteMany({
      where: { source, workspace_id },
    });
    await tx.integration.delete({
      where: { id: integration.id },
    });
  });

  client.query({
    query: `
      ALTER TABLE activity DELETE 
      WHERE member_id IN (
        SELECT id FROM member 
        WHERE source = '${source}'
        AND workspace_id = '${workspace_id}'
      );`,
  });
  client.query({
    query: `
      ALTER TABLE log DELETE 
      WHERE member_id IN (
        SELECT id FROM member 
        WHERE source = '${source}'
        AND workspace_id = '${workspace_id}'
      );`,
  });
  client.query({
    query: `
      ALTER TABLE activity_type DELETE 
      WHERE source = '${source}'
      AND workspace_id = '${workspace_id}';`,
  });
  client.query({
    query: `
      ALTER TABLE channel DELETE
      WHERE source = '${source}'
      AND workspace_id = '${workspace_id}';`,
  });
  client.query({
    query: `
      ALTER TABLE company DELETE
      WHERE source = '${source}'
      AND workspace_id = '${workspace_id}';`,
  });
  client.query({
    query: `
      ALTER TABLE member DELETE
      WHERE source = '${source}'
      AND workspace_id = '${workspace_id}';`,
  });
  client.query({
    query: `
      ALTER TABLE profile DELETE
      WHERE JSONExtractString(CAST(attributes AS String), 'source') = '${source}'
      AND workspace_id = '${workspace_id}';`,
  });

  return { success: true };
};

import { env } from "@conquest/env";
import {
  type Integration,
  LinkedInIntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { client } from "../client";
import { listSubscriptions } from "../linkedin/listSubscriptions";
import { removeWebhook } from "../linkedin/removeWebhook";
import { deleteWebhook } from "../livestorm/deleteWebhook";
import { listWebhooks } from "../livestorm/listWebhooks";
import { decrypt } from "../utils/decrypt";

type Props = {
  integration: Integration;
};

export const deleteIntegration = async ({ integration }: Props) => {
  const { workspace_id, details } = integration;
  const { source } = details;

  if (source === "Livestorm") {
    const { access_token, access_token_iv } = details;

    const decryptedToken = await decrypt({
      access_token,
      iv: access_token_iv,
    });

    await client.query({
      query: `
          ALTER TABLE events
          DELETE WHERE source = ${source}
        `,
    });

    const webhooks = await listWebhooks({ accessToken: decryptedToken });

    for (const webhook of webhooks) {
      await deleteWebhook({ accessToken: decryptedToken, id: webhook.id });
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

    await client.query({
      query: `
          ALTER TABLE posts
          DELETE WHERE workspace_id = ${workspace_id}
        `,
    });

    const { subscriptions } = await listSubscriptions({ linkedin });

    if (subscriptions.elements.length > 0) {
      await removeWebhook({ linkedin });
    }
  }

  await Promise.all([
    client.query({
      query: `
          ALTER TABLE activities
          DELETE WHERE source = '${source}'
        `,
    }),
    client.query({
      query: `
          ALTER TABLE activity_types
          DELETE WHERE source = '${source}'
        `,
    }),
    client.query({
      query: `
          ALTER TABLE channels
          DELETE WHERE source = '${source}'
        `,
    }),
    client.query({
      query: `
          ALTER TABLE tags
          DELETE WHERE source = '${source}'
        `,
    }),
    client.query({
      query: `
          ALTER TABLE companies
          DELETE WHERE source = '${source}'
        `,
    }),
    client.query({
      query: `
        ALTER TABLE members
        DELETE WHERE source = '${source}' AND workspace_id = '${workspace_id}'
      `,
    }),
    client.query({
      query: `
        ALTER TABLE profiles
        DELETE WHERE JSONExtractString(CAST(attributes AS String), 'source') = '${source}' AND workspace_id = '${workspace_id}'
      `,
    }),
    client.query({
      query: `
          ALTER TABLE integrations
          DELETE WHERE id = '${integration.id}'
        `,
    }),
  ]);
};

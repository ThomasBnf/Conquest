import { client } from "@conquest/clickhouse/client";
import { env } from "@conquest/env";
import { deleteWebhook } from "@conquest/trigger/livestorm/deleteWebhook";
import { getRefreshToken } from "@conquest/trigger/livestorm/getRefreshToken";
import { listWebhooks } from "@conquest/trigger/livestorm/listWebhooks";
import {
  GithubIntegrationSchema,
  type Integration,
  LivestormIntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { deleteManyEvents } from "../events/deleteManyEvents";
import { prisma } from "../prisma";
import { decrypt } from "../utils/decrypt";

type Props = {
  integration: Integration;
};

export const deleteIntegration = async ({ integration }: Props) => {
  const { workspaceId, details } = integration;
  const { source } = details;

  if (source === "Discord") {
    await prisma.tag.deleteMany({
      where: { source, workspaceId },
    });
  }

  if (source === "Github") {
    const github = GithubIntegrationSchema.parse(integration);
    const { accessToken, iv } = github.details;

    // const decryptedToken = await decrypt({ accessToken, iv });
    // const octokit = new Octokit({ auth: decryptedToken });

    // await listAndDeleteWebhooks({ octokit, github });

    client.query({
      query: `
        ALTER TABLE profile DELETE
        WHERE memberId IN (
          SELECT id FROM member FINAL
          WHERE source = '${source}'
          AND workspaceId = '${workspaceId}'
        );`,
    });
  }

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
    const { accessToken, accessTokenIv } = details;

    const token = await decrypt({
      accessToken,
      iv: accessTokenIv,
    });

    const web = new WebClient(token);

    await web.apps.uninstall({
      token,
      client_id: env.NEXT_PUBLIC_SLACK_CLIENT_ID,
      client_secret: env.SLACK_CLIENT_SECRET,
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.tag.deleteMany({
      where: { source, workspaceId },
    });
    await tx.integration.delete({
      where: { id: integration.id },
    });
  });

  client.query({
    query: `
      ALTER TABLE activity DELETE 
      WHERE source = '${source}'
      AND workspaceId = '${workspaceId}'`,
  });
  client.query({
    query: `
      ALTER TABLE log DELETE 
      WHERE memberId IN (
        SELECT id FROM member FINAL
        WHERE source = '${source}'
        AND workspaceId = '${workspaceId}'
      );`,
  });
  client.query({
    query: `
      ALTER TABLE activityType DELETE 
      WHERE source = '${source}'
      AND workspaceId = '${workspaceId}'`,
  });
  client.query({
    query: `
      ALTER TABLE channel DELETE
      WHERE source = '${source}'
      AND workspaceId = '${workspaceId}'`,
  });
  client.query({
    query: `
      ALTER TABLE company DELETE
      WHERE source = '${source}'
      AND workspaceId = '${workspaceId}'`,
  });
  client.query({
    query: `
      ALTER TABLE member DELETE
      WHERE source = '${source}'
      AND workspaceId = '${workspaceId}'`,
  });
  client.query({
    query: `
      ALTER TABLE profile DELETE
      WHERE JSONExtractString(CAST(attributes AS String), 'source') = '${source}'
      AND workspaceId = '${workspaceId}'`,
  });

  return { success: true };
};

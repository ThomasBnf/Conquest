import { client } from "@conquest/clickhouse/client";
import { deleteManyEvents } from "@conquest/db/events/deleteManyEvents";
import { prisma } from "@conquest/db/prisma";
import { decrypt } from "@conquest/db/utils/decrypt";
import { env } from "@conquest/env";
import {
  GithubIntegrationSchema,
  IntegrationSchema,
  LivestormIntegrationSchema,
} from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { Octokit } from "octokit";
import { z } from "zod";
import { createTokenManager } from "../github/createTokenManager";
import { listAndDeleteWebhooks } from "../github/listAndDeleteWebhooks";
import { deleteWebhook } from "../livestorm/deleteWebhook";
import { getRefreshToken } from "../livestorm/getRefreshToken";
import { listWebhooks } from "../livestorm/listWebhooks";

export const deleteIntegration = schemaTask({
  id: "delete-integration",
  machine: "small-2x",
  schema: z.object({
    integration: IntegrationSchema,
    jwt: z.string().nullable(),
  }),
  run: async ({ integration, jwt }) => {
    const { workspaceId, details } = integration;
    const { source } = details;

    if (source === "Discord") {
      const { externalId } = integration;

      if (!externalId) {
        logger.error("No externalId found for Discord integration");
        return;
      }

      await prisma.tag.deleteMany({
        where: { source, workspaceId },
      });
    }

    if (source === "Github") {
      const github = GithubIntegrationSchema.parse(integration);
      const { installationId } = github.details;

      const tokenManager = await createTokenManager(github);
      const token = await tokenManager.getToken();
      const octokit = new Octokit({ auth: token });

      await listAndDeleteWebhooks({ octokit, github });

      const appOctokit = new Octokit({ auth: jwt });

      try {
        await appOctokit.request(
          "DELETE /app/installations/{installation_id}",
          {
            installation_id: installationId,
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          },
        );
      } catch (error) {
        console.error("Erreur lors de la suppression du repository:", error);
      }

      await client.query({
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

    await prisma.tag.deleteMany({
      where: { source, workspaceId },
    });

    logger.info("ALTER TABLE activity DELETE");

    await client.query({
      query: `
        ALTER TABLE activity DELETE 
        WHERE source = '${source}'
        AND workspaceId = '${workspaceId}'`,
    });

    logger.info("ALTER TABLE log DELETE");

    await client.query({
      query: `
        ALTER TABLE log DELETE 
        WHERE memberId IN (
          SELECT id FROM member FINAL
          WHERE source = '${source}'
          AND workspaceId = '${workspaceId}'
        );`,
    });

    logger.info("ALTER TABLE activityType DELETE");

    await client.query({
      query: `
      ALTER TABLE activityType DELETE 
      WHERE source = '${source}'
      AND workspaceId = '${workspaceId}'`,
    });

    logger.info("ALTER TABLE channel DELETE");

    await client.query({
      query: `
        ALTER TABLE channel DELETE
        WHERE source = '${source}'
        AND workspaceId = '${workspaceId}'`,
    });

    logger.info("ALTER TABLE company DELETE");

    await client.query({
      query: `
        ALTER TABLE company DELETE
        WHERE source = '${source}'
        AND workspaceId = '${workspaceId}'`,
    });

    logger.info("ALTER TABLE member DELETE");

    await client.query({
      query: `
        ALTER TABLE member DELETE
        WHERE source = '${source}'
        AND workspaceId = '${workspaceId}'`,
    });

    logger.info("ALTER TABLE profile DELETE");

    await client.query({
      query: `
        ALTER TABLE profile DELETE
        WHERE JSONExtractString(CAST(attributes AS String), 'source') = '${source}'
        AND workspaceId = '${workspaceId}'`,
    });

    logger.info("ALTER TABLE tag DELETE");
  },
});

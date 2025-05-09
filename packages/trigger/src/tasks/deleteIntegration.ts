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
import { schemaTask } from "@trigger.dev/sdk/v3";
import { Octokit } from "octokit";
import { z } from "zod";
import { createTokenManager } from "../github/createTokenManager";
import { generateJWT } from "../github/generateJWT";
import { listAndDeleteWebhooks } from "../github/listAndDeleteWebhooks";
import { deleteWebhook } from "../livestorm/deleteWebhook";
import { getRefreshToken } from "../livestorm/getRefreshToken";
import { listWebhooks } from "../livestorm/listWebhooks";

export const deleteIntegration = schemaTask({
  id: "delete-integration",
  machine: "small-2x",
  schema: z.object({
    integration: IntegrationSchema,
  }),
  run: async ({ integration }) => {
    const { workspaceId, details } = integration;
    const { source } = details;

    if (source === "Discord") {
      await prisma.tag.deleteMany({
        where: { source, workspaceId },
      });
    }

    if (source === "Github") {
      const github = GithubIntegrationSchema.parse(integration);
      const { repo, installationId, owner } = github.details;

      const tokenManager = await createTokenManager(github);
      const token = await tokenManager.getToken();
      const octokit = new Octokit({ auth: token });

      await listAndDeleteWebhooks({ octokit, github });

      const jwt = generateJWT();
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

    await prisma.tag.deleteMany({
      where: { source, workspaceId },
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
    try {
      client.query({
        query: `
        ALTER TABLE activityType DELETE 
        WHERE source = '${source}'
        AND workspaceId = '${workspaceId}'`,
      });
    } catch (error) {
      console.error(error);
    }
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
  },
});

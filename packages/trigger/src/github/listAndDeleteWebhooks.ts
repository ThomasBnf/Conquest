import { env } from "@conquest/env";
import type { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import { logger } from "@trigger.dev/sdk/v3";
import type { Octokit } from "octokit";

type Props = {
  octokit: Octokit;
  github: GithubIntegration;
};

export const listAndDeleteWebhooks = async ({ octokit, github }: Props) => {
  const { details } = github;
  const { owner, repo } = details;

  try {
    const response = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });

    if (response.status !== 200) {
      logger.error("Error listing webhooks", { response });
      return;
    }

    const filteredWebhooks = response.data.filter(
      (webhook) =>
        webhook.config.url === `${env.NEXT_PUBLIC_URL}/webhook/github`,
    );

    for (const webhook of filteredWebhooks) {
      const { id } = webhook;

      await octokit.rest.repos.deleteWebhook({
        owner,
        repo,
        hook_id: id,
      });
    }
  } catch (error) {
    logger.error("Failed to fetch webhooks", { error, owner, repo });
  }
};

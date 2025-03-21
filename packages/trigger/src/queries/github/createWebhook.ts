import { env } from "@conquest/env";
import { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import { logger } from "@trigger.dev/sdk/v3";
import { Octokit } from "octokit";

type Props = {
  octokit: Octokit;
  github: GithubIntegration;
};

export const createWebhook = async ({ octokit, github }: Props) => {
  const { details } = github;
  const { owner, repo } = details;

  const { data: existingHooks } = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });

  logger.info("existingHooks", { existingHooks });

  const webhookUrl = `${env.NEXT_PUBLIC_BASE_URL}/webhook/github`;

  if (existingHooks.some((hook) => hook.config.url === webhookUrl)) {
    logger.info("Webhook already exists");
    return;
  }

  const response = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    name: "web",
    active: true,
    events: ["star", "issues", "issue_comment", "pull_request"],
    config: {
      url: `${env.NEXT_PUBLIC_BASE_URL}/webhook/github`,
      content_type: "json",
      secret: env.GITHUB_WEBHOOK_SECRET,
      insecure_ssl: "0",
    },
  });

  logger.info("createWebhook", { response });

  const { data: webhooks } = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });

  logger.info("webhooks", { webhooks });
};

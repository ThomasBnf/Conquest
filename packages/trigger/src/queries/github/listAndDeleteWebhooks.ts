import { env } from "@conquest/env";
import { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import { Octokit } from "octokit";

type Props = {
  octokit: Octokit;
  github: GithubIntegration;
};

export const listAndDeleteWebhooks = async ({ octokit, github }: Props) => {
  const { details } = github;
  const { owner, repo } = details;

  const response = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });

  if (response.status !== 200) console.log(response);

  const webhooks = response.data;

  const filteredWebhooks = webhooks.filter(
    (webhook) =>
      webhook.config.url === `${env.NEXT_PUBLIC_BASE_URL}/webhook/github`,
  );

  for (const webhook of filteredWebhooks) {
    const { id } = webhook;

    await octokit.rest.repos.deleteWebhook({
      owner,
      repo,
      hook_id: id,
    });
  }
};

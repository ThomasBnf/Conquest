import { env } from "@conquest/env";
import { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Endpoints } from "@octokit/types";
import { Octokit } from "octokit";

type Webhook =
  Endpoints["GET /repos/{owner}/{repo}/hooks"]["response"]["data"][number];

type Props = {
  octokit: Octokit;
  github: GithubIntegration;
};

export const listAndDeleteWebhooks = async ({ octokit, github }: Props) => {
  const { details } = github;
  const { owner, repo } = details;

  const response = await octokit.request(`GET /repos/${owner}/${repo}/hooks`, {
    owner,
    repo,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const webhooks = response.data as Webhook[];

  const filteredWebhooks = webhooks.filter(
    (webhook) =>
      webhook.config.url === `${env.NEXT_PUBLIC_BASE_URL}/webhook/github`,
  );

  for (const webhook of filteredWebhooks) {
    const { id } = webhook;

    await octokit.request(`DELETE /repos/${owner}/${repo}/hooks/${id}`, {
      owner,
      repo,
      hook_id: id,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  }
};

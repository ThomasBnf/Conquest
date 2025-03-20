import { env } from "@conquest/env";
import { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import { Octokit } from "octokit";

type Props = {
  octokit: Octokit;
  github: GithubIntegration;
};

export const createWebhook = async ({ octokit, github }: Props) => {
  const { details } = github;
  const { owner, repo } = details;

  await octokit.request(`POST /repos/${owner}/${repo}/hooks`, {
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
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
};

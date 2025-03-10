import type { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Endpoints } from "@octokit/types";
import { wait } from "@trigger.dev/sdk/v3";
import { subDays } from "date-fns";
import type { Octokit } from "octokit";
import { createGithubMember } from "./createGithubMember";

type Issue =
  Endpoints["GET /repos/{owner}/{repo}/issues"]["response"]["data"][number];

type Props = {
  octokit: Octokit;
  github: GithubIntegration;
};

export const createManyIssues = async ({ octokit, github }: Props) => {
  const { details, workspace_id } = github;
  const { name, owner } = details;

  let page = 1;
  const issues: Issue[] = [];
  const since = subDays(new Date(), 365).toString();

  while (true) {
    const { headers, data } = await octokit.rest.issues.listForRepo({
      owner,
      repo: name,
      page,
      state: "all",
      per_page: 100,
      since,
      sort: "created",
      direction: "desc",
    });

    issues.push(...data);

    if (data.length < 100) break;

    const rateLimit = Number(headers["x-ratelimit-remaining"]);
    const rateLimitReset = headers["x-ratelimit-reset"];

    if (rateLimit === 0) {
      await wait.until({ date: new Date(Number(rateLimitReset) * 1000) });
    }

    page++;
  }

  for (const issue of issues) {
    const { user } = issue;
    const { id } = user ?? {};

    if (!id) continue;

    await createGithubMember({
      octokit,
      id,
      workspace_id,
    });

    // const rateLimit = Number(headers["x-ratelimit-remaining"]);
    // const rateLimitReset = headers["x-ratelimit-reset"];

    // if (rateLimit === 0) {
    //   await wait.until({ date: new Date(Number(rateLimitReset) * 1000) });
    // }
  }
};

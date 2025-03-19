import type { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Endpoints } from "@octokit/types";
import { logger } from "@trigger.dev/sdk/v3";
import { subDays } from "date-fns";
import type { Octokit } from "octokit";
import { checkRateLimit } from "./checkRateLimit";
import { createGithubMember } from "./createGithubMember";

type Stargazer =
  Endpoints["GET /repos/{owner}/{repo}/stargazers"]["response"]["data"][number];

type Props = {
  octokit: Octokit;
  github: GithubIntegration;
};

export const listStargazers = async ({ octokit, github }: Props) => {
  const { details, workspace_id } = github;
  const { name, owner } = details;

  let page = 1;
  const stargazers: Stargazer[] = [];
  const since = subDays(new Date(), 365).toString();

  while (true) {
    const { headers, data } = await octokit.rest.activity.listStargazersForRepo(
      {
        owner,
        repo: name,
        page,
        state: "all",
        per_page: 100,
        since,
        sort: "created",
        direction: "desc",
      },
    );

    stargazers.push(...data);

    if (data.length < 100) break;

    await checkRateLimit(headers);

    page++;
  }

  for (const stargazer of stargazers) {
    logger.info("stargazer", { stargazer });
    const { user } = stargazer as { user: { id: number; login: string } };
    const { id, login } = user ?? {};

    if (!id || login?.includes("[bot]")) continue;

    const { headers } = await createGithubMember({
      octokit,
      id,
      workspace_id,
    });

    await checkRateLimit(headers);
  }
};

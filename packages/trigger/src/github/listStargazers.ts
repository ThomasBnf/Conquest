import { createActivity } from "@conquest/clickhouse/activities/createActivity";
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
  const { details, workspaceId } = github;
  const { owner, repo } = details;

  let page = 1;
  const since = subDays(new Date(), 365).toString();

  while (true) {
    const { headers, data } = await octokit.rest.activity.listStargazersForRepo(
      {
        owner,
        repo,
        page,
        state: "all",
        per_page: 100,
        since,
        sort: "created",
        direction: "desc",
        headers: {
          accept: "application/vnd.github.star+json",
        },
      },
    );

    logger.info("Stargazers", { count: data.length, data });

    for (const stargazer of data) {
      const { starred_at, user } = stargazer as {
        starred_at: string;
        user: {
          id: number;
        };
      };
      const { id } = user;

      const { headers, member } = await createGithubMember({
        octokit,
        id,
        createdAt: new Date(starred_at),
        workspaceId,
      });

      await checkRateLimit(headers);

      if (!member) continue;

      await createActivity({
        activityTypeKey: "github:star",
        message: `Starred the repository ${repo}`,
        memberId: member.id,
        createdAt: new Date(starred_at),
        updatedAt: new Date(starred_at),
        source: "Github",
        workspaceId,
      });

      await checkRateLimit(headers);
    }

    if (data.length < 100) break;

    await checkRateLimit(headers);

    page++;
  }
};

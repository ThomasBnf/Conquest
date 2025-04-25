import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import type { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Endpoints } from "@octokit/types";
import { logger } from "@trigger.dev/sdk/v3";
import { subDays } from "date-fns";
import type { Octokit } from "octokit";
import { checkRateLimit } from "./checkRateLimit";
import { createGithubMember } from "./createGithubMember";

type PullRequest =
  Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"]["data"][number];

type Props = {
  octokit: Octokit;
  github: GithubIntegration;
};

export const createManyPullRequests = async ({ octokit, github }: Props) => {
  const { details, workspaceId } = github;
  const { owner, repo } = details;

  let page = 1;
  const pullRequests: PullRequest[] = [];
  const since = subDays(new Date(), 365).toString();

  while (true) {
    const { headers, data } = await octokit.rest.pulls.list({
      owner,
      repo,
      page,
      state: "all",
      per_page: 100,
      since,
      sort: "created",
      direction: "desc",
    });

    logger.info("pullRequests", { data });

    pullRequests.push(...data);

    if (data.length < 100) break;

    await checkRateLimit(headers);

    page++;
  }

  logger.info("pullRequests", {
    count: pullRequests.length,
    pullRequests,
  });

  for (const pullRequest of pullRequests) {
    const { number, user, title, body, created_at, updated_at } = pullRequest;
    const { id: userId, login } = user ?? {};

    if (!userId || login?.includes("[bot]")) continue;

    const { headers, member } = await createGithubMember({
      octokit,
      id: userId,
      workspaceId,
    });

    await checkRateLimit(headers);

    if (!member) continue;

    await createActivity({
      externalId: String(number),
      activityTypeKey: "github:pr",
      title: `#${number} - ${title}`,
      message: body ?? "",
      memberId: member.id,
      createdAt: new Date(created_at),
      updatedAt: new Date(updated_at),
      source: "Github",
      workspaceId,
    });
  }
};

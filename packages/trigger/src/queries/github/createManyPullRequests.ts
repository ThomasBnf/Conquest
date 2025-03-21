import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import type { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
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
  const { details, workspace_id } = github;
  const { owner, repo } = details;

  const createdMembers: Member[] = [];

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
      workspace_id,
    });

    await checkRateLimit(headers);

    if (!member) continue;

    await createActivity({
      external_id: String(number),
      activity_type_key: "github:pr",
      title: `#${number} - ${title}`,
      message: body ?? "",
      member_id: member.id,
      created_at: new Date(created_at),
      updated_at: new Date(updated_at),
      source: "Github",
      workspace_id,
    });

    createdMembers.push(member);
  }

  return createdMembers;
};

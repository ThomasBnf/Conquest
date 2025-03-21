import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import type { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import type { Endpoints } from "@octokit/types";
import { logger } from "@trigger.dev/sdk/v3";
import { subDays } from "date-fns";
import type { Octokit } from "octokit";
import { checkRateLimit } from "./checkRateLimit";
import { createGithubMember } from "./createGithubMember";
import { createManyComments } from "./createManyComments";

type Issue =
  Endpoints["GET /repos/{owner}/{repo}/issues"]["response"]["data"][number];

type Props = {
  octokit: Octokit;
  github: GithubIntegration;
};

export const createManyIssues = async ({ octokit, github }: Props) => {
  const { details, workspace_id } = github;
  const { owner, repo } = details;

  const createdMembers: Member[] = [];

  let page = 1;
  const issues: Issue[] = [];
  const since = subDays(new Date(), 365).toString();

  while (true) {
    const response = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      page,
      state: "all",
      per_page: 100,
      since,
      sort: "created",
      direction: "desc",
    });

    const { headers, data } = response;

    logger.info("issues", { response });

    issues.push(...data.filter((issue) => !issue.pull_request));

    if (data.length < 100) break;

    await checkRateLimit(headers);

    page++;
  }

  logger.info("issues", {
    count: issues.length,
    issues,
  });

  for (const issue of issues) {
    const { number, user, title, body, comments, created_at, updated_at } =
      issue;
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
      activity_type_key: "github:issue",
      title: `#${number} - ${title}`,
      message: body ?? "",
      member_id: member?.id,
      created_at: new Date(created_at),
      updated_at: new Date(updated_at),
      source: "Github",
      workspace_id,
    });

    createdMembers.push(member);

    if (comments > 0) {
      const members = await createManyComments({
        octokit,
        github,
        issue_number: number,
      });

      createdMembers.push(...members);
    }
  }

  return createdMembers;
};

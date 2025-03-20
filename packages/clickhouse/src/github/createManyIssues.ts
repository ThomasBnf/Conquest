import type { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Endpoints } from "@octokit/types";
import { logger } from "@trigger.dev/sdk/v3";
import { subDays } from "date-fns";
import type { Octokit } from "octokit";
import { checkRateLimit } from "../../../trigger/src/queries/checkRateLimit";
import { createActivity } from "../activities/createActivity";
import { createGithubMember } from "./createGithubMember";

type Issue =
  Endpoints["GET /repos/{owner}/{repo}/issues"]["response"]["data"][number];

type Props = {
  octokit: Octokit;
  github: GithubIntegration;
};

export const createManyIssues = async ({ octokit, github }: Props) => {
  const { details, workspace_id } = github;
  const { owner, repo } = details;

  let page = 1;
  const issues: Issue[] = [];
  const since = subDays(new Date(), 365).toString();

  while (true) {
    const { headers, data } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      page,
      state: "all",
      per_page: 100,
      since,
      sort: "created",
      direction: "desc",
    });

    issues.push(...data.filter((issue) => !issue.pull_request));

    if (data.length < 100) break;

    await checkRateLimit(headers);

    page++;
  }

  logger.info("issues", { issuesLength: issues.length, issues });

  for (const issue of issues) {
    const { number, user, title, body, comments, created_at, updated_at } =
      issue;
    const { id: userId, login } = user ?? {};

    if (!userId || login?.includes("[bot]")) continue;

    const { headers, member_id } = await createGithubMember({
      octokit,
      id: userId,
      workspace_id,
    });

    await checkRateLimit(headers);

    await createActivity({
      external_id: String(number),
      activity_type_key: "github:issue",
      title: `#${number} - ${title}`,
      message: body ?? "",
      member_id,
      created_at: new Date(created_at),
      updated_at: new Date(updated_at),
      source: "Github",
      workspace_id,
    });

    if (comments > 0) {
      const { headers, data: comments } =
        await octokit.rest.issues.listComments({
          owner,
          repo,
          issue_number: number,
        });

      await checkRateLimit(headers);

      for (const comment of comments) {
        const { id: commentId, user, body, created_at, updated_at } = comment;
        const { id: userId, login } = user ?? {};

        if (!userId || login?.includes("[bot]")) continue;

        const { headers, member_id } = await createGithubMember({
          octokit,
          id: userId,
          workspace_id,
        });

        await createActivity({
          external_id: String(commentId),
          activity_type_key: "github:comment",
          message: body ?? "",
          member_id,
          reply_to: String(number),
          created_at: new Date(created_at),
          updated_at: new Date(updated_at),
          source: "Github",
          workspace_id,
        });

        await checkRateLimit(headers);
      }
    }
  }
};

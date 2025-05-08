import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import type { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
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
  const { details, workspaceId } = github;
  const { owner, repo } = details;

  let page = 1;
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

    logger.info("Issues", { count: data.length, data });

    for (const issue of data) {
      const { number, user, title, body, comments, created_at, updated_at } =
        issue;
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
        activityTypeKey: "github:issue",
        title: `#${number} - ${title}`,
        message: body ?? "",
        memberId: member?.id,
        createdAt: new Date(created_at),
        updatedAt: new Date(updated_at),
        source: "Github",
        workspaceId,
      });

      if (comments > 0) {
        await createManyComments({
          octokit,
          github,
          issueNumber: number,
        });
      }
    }

    if (data.length < 100) break;

    await checkRateLimit(headers);

    page++;
  }
};

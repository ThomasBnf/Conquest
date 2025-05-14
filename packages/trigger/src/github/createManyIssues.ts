import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { logger } from "@trigger.dev/sdk/v3";
import { subDays } from "date-fns";
import { Octokit } from "octokit";
import { checkRateLimit } from "./checkRateLimit";
import { createGithubMember } from "./createGithubMember";
import { createManyComments } from "./createManyComments";
import { TokenManager } from "./createTokenManager";

export const createManyIssues = async (tokenManager: TokenManager) => {
  const { getToken, getGithub } = tokenManager;

  let page = 1;
  const since = subDays(new Date(), 365).toString();

  while (true) {
    const token = await getToken();
    const github = getGithub();

    const { details, workspaceId } = github;
    const { owner, repo } = details;
    const octokit = new Octokit({ auth: token });

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
        const commentToken = await getToken();
        const commentOctokit = new Octokit({ auth: commentToken });

        await createManyComments({
          octokit: commentOctokit,
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

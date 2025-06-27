import { createActivity } from "@conquest/db/activity/createActivity";
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
  const last90Days = subDays(new Date(), 90).toString();

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
      since: last90Days,
      sort: "created",
      direction: "desc",
    });

    const { headers, data } = response;

    logger.info("Issues", { count: data.length, data });

    for (const issue of data) {
      const { number, user, title, body, comments, created_at, updated_at } =
        issue;
      const { login } = user ?? {};

      if (!login || login?.includes("bot")) continue;

      const { headers, member } = await createGithubMember({
        octokit,
        login,
        workspaceId,
      });

      await checkRateLimit(headers);

      if (!member) continue;

      await createActivity({
        externalId: String(number),
        activityTypeKey: "github:issue",
        title: `#${number} - ${title}`,
        message: body,
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

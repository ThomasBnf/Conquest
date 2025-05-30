import { createActivity } from "@conquest/clickhouse/activity/createActivity";
import { logger } from "@trigger.dev/sdk/v3";
import { subDays } from "date-fns";
import { Octokit } from "octokit";
import { checkRateLimit } from "./checkRateLimit";
import { createGithubMember } from "./createGithubMember";
import { TokenManager } from "./createTokenManager";

export const listStargazers = async (tokenManager: TokenManager) => {
  const { getToken, getGithub } = tokenManager;

  let page = 1;
  const last90Days = subDays(new Date(), 90).toString();

  while (true) {
    const token = await getToken();
    const github = getGithub();

    const { details, workspaceId } = github;
    const { owner, repo } = details;
    const octokit = new Octokit({ auth: token });

    const { headers, data } = await octokit.rest.activity.listStargazersForRepo(
      {
        owner,
        repo,
        page,
        state: "all",
        per_page: 100,
        since: last90Days,
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
          login: string;
        };
      };
      const { login } = user;

      const { headers, member } = await createGithubMember({
        octokit,
        login,
        createdAt: new Date(starred_at),
        workspaceId,
      });

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

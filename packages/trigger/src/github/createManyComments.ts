import { createActivity } from "@conquest/clickhouse/activity/createActivity";
import { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import { Octokit } from "octokit";
import { checkRateLimit } from "./checkRateLimit";
import { createGithubMember } from "./createGithubMember";

type Props = {
  octokit: Octokit;
  github: GithubIntegration;
  issueNumber: number;
};

export const createManyComments = async ({
  octokit,
  github,
  issueNumber,
}: Props) => {
  const { details, workspaceId } = github;
  const { owner, repo } = details;

  const { headers, data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
  });

  await checkRateLimit(headers);

  for (const comment of comments) {
    const { id: commentId, user, body, created_at, updated_at } = comment;
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
      externalId: String(commentId),
      activityTypeKey: "github:comment",
      message: body ?? "",
      memberId: member.id,
      replyTo: String(issueNumber),
      createdAt: new Date(created_at),
      updatedAt: new Date(updated_at),
      source: "Github",
      workspaceId,
    });

    await checkRateLimit(headers);
  }
};

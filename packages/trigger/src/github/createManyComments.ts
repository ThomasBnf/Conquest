import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { GithubIntegration } from "@conquest/zod/schemas/integration.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { Octokit } from "octokit";
import { checkRateLimit } from "./checkRateLimit";
import { createGithubMember } from "./createGithubMember";

type Props = {
  octokit: Octokit;
  github: GithubIntegration;
  issue_number: number;
};

export const createManyComments = async ({
  octokit,
  github,
  issue_number,
}: Props) => {
  const { details, workspace_id } = github;
  const { owner, repo } = details;

  const createdMembers: Member[] = [];

  const { headers, data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number,
  });

  await checkRateLimit(headers);

  for (const comment of comments) {
    const { id: commentId, user, body, created_at, updated_at } = comment;
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
      external_id: String(commentId),
      activity_type_key: "github:comment",
      message: body ?? "",
      member_id: member.id,
      reply_to: String(issue_number),
      created_at: new Date(created_at),
      updated_at: new Date(updated_at),
      source: "Github",
      workspace_id,
    });

    await checkRateLimit(headers);

    createdMembers.push(member);
  }

  return createdMembers;
};

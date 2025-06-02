import { getProfile } from "@conquest/clickhouse/profile/getProfile";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { createTokenManager } from "../github/createTokenManager";
import { getGithubProfile } from "./getGithubProfile";
import { Octokit } from "octokit";

type Props = {
  members: Record<string, string>[];
  workspaceId: string;
};

export const processGithubProfiles = async ({
  members,
  workspaceId,
}: Props) => {
  const githubMembers = members.filter(
    (member) => member.githubLogin && member.githubLogin.trim() !== "",
  );

  const githubIntegration = GithubIntegrationSchema.parse(
    await getIntegrationBySource({ source: "Github", workspaceId }),
  );

  const tokenManager = await createTokenManager(githubIntegration);

  const { getToken } = tokenManager;

  const token = await getToken();
  const octokit = new Octokit({ auth: token });

  for (const member of githubMembers) {
    const { githubUsername } = member;

    if (!githubUsername) continue;

    const profile = await getProfile({
      externalId: githubUsername,
      workspaceId,
    });

    if (profile) await getGithubProfile({ octokit, profile });
  }
};

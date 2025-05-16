import { createMember } from "@conquest/clickhouse/member/createMember";
import { getMember } from "@conquest/clickhouse/member/getMember";
import { createProfile } from "@conquest/clickhouse/profile/createProfile";
import { getProfile } from "@conquest/clickhouse/profile/getProfile";
import { logger } from "@trigger.dev/sdk/v3";
import { Octokit } from "octokit";

type Props = {
  octokit: Octokit;
  id: number;
  createdAt?: Date;
  workspaceId: string;
};
export const createGithubMember = async ({
  octokit,
  id,
  createdAt,
  workspaceId,
}: Props) => {
  const response = await octokit.rest.users.getById({ account_id: id });
  const { headers, data } = response;

  const profile = await getProfile({
    externalId: String(id),
    workspaceId,
  });

  if (profile) {
    const member = await getMember({ id: profile.memberId });
    return { member, headers };
  }

  logger.info("createGithubMember", { response });

  const {
    avatar_url,
    bio,
    blog,
    email,
    followers,
    location,
    login,
    name,
    twitter_username,
  } = data;

  const { firstName, lastName } = parseFullName(name);

  const member = await createMember({
    firstName,
    lastName,
    primaryEmail: email ?? "",
    emails: email ? [email] : [],
    avatarUrl: avatar_url,
    source: "Github",
    createdAt,
    workspaceId,
  });

  await createProfile({
    externalId: String(id),
    attributes: {
      source: "Github",
      login: login ?? null,
      bio: bio ?? null,
      blog: blog ?? null,
      followers: followers ?? 0,
      location: location ?? null,
    },
    memberId: member.id,
    createdAt,
    workspaceId,
  });

  if (twitter_username) {
    const twitterProfile = await getProfile({
      externalId: twitter_username,
      workspaceId,
    });

    if (!twitterProfile) {
      await createProfile({
        memberId: member.id,
        attributes: {
          source: "Twitter",
          username: twitter_username,
        },
        createdAt,
        workspaceId,
      });
    }
  }

  return {
    member,
    headers,
  };
};

const parseFullName = (fullName: string | null) => {
  if (!fullName) return { firstName: "", lastName: "" };

  const nameParts = fullName.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  return { firstName, lastName };
};

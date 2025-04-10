import { createMember } from "@conquest/clickhouse/members/createMember";
import { getMember } from "@conquest/clickhouse/members/getMember";
import { createProfile } from "@conquest/clickhouse/profiles/createProfile";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import { logger } from "@trigger.dev/sdk/v3";
import type { Octokit } from "octokit";

type Props = {
  octokit: Octokit;
  id: number;
  created_at?: Date;
  workspace_id: string;
};

export const createGithubMember = async ({
  octokit,
  id,
  created_at,
  workspace_id,
}: Props) => {
  const response = await octokit.rest.users.getById({ account_id: id });
  const { headers, data } = response;

  logger.info("createGithubMember", { response });

  const profile = await getProfile({
    external_id: String(id),
    workspace_id,
  });

  if (profile) {
    const member = await getMember({ id: profile.member_id });
    return { member, headers };
  }

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
    first_name: firstName,
    last_name: lastName,
    primary_email: email ?? "",
    emails: email ? [email] : [],
    avatar_url,
    source: "Github",
    created_at,
    workspace_id,
  });

  await createProfile({
    external_id: String(id),
    attributes: {
      source: "Github",
      login: login ?? null,
      bio: bio ?? null,
      blog: blog ?? null,
      followers: followers ?? 0,
      location: location ?? null,
    },
    member_id: member.id,
    created_at,
    workspace_id,
  });

  if (twitter_username) {
    await createProfile({
      member_id: member.id,
      attributes: {
        source: "Twitter",
        username: twitter_username,
      },
      created_at,
      workspace_id,
    });
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

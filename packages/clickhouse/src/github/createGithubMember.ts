import { createMember } from "@conquest/clickhouse/members/createMember";
import { createProfile } from "@conquest/clickhouse/profiles/createProfile";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
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
  const { headers, data } = await octokit.rest.users.getById({
    account_id: id,
  });

  let profile = await getProfile({ external_id: String(id), workspace_id });

  if (!profile) {
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

    const firstName = name?.split(" ")[0];
    const lastName = name?.split(" ")[1];

    const member = await createMember({
      first_name: firstName,
      last_name: lastName,
      primary_email: email ?? "",
      avatar_url,
      source: "Github",
      created_at,
      workspace_id,
    });

    profile = await createProfile({
      external_id: String(id),
      attributes: {
        source: "Github",
        login,
        bio: bio ?? null,
        blog: blog ?? null,
        followers,
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
  }

  return {
    member_id: profile?.member_id,
    headers,
  };
};

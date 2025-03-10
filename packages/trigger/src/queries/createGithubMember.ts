import { createMember } from "@conquest/clickhouse/members/createMember";
import { createProfile } from "@conquest/clickhouse/profiles/createProfile";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import type { Octokit } from "octokit";

type Props = {
  octokit: Octokit;
  id: number;
  workspace_id: string;
};

export const createGithubMember = async ({
  octokit,
  id,
  workspace_id,
}: Props) => {
  const { headers, data } = await octokit.rest.users.getById({
    account_id: id,
  });

  const profile = await getProfile({ external_id: id.toString() });

  if (!profile) {
    const {
      avatar_url,
      bio,
      blog,
      company,
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
    });

    console.log(followers);
    console.log(typeof followers);

    await createProfile({
      external_id: String(id),
      attributes: {
        source: "Github",
        username: login,
        blog,
        followers,
      },
      member_id: member.id,
      workspace_id,
    });

    // if (twitter_username) {
    //   await createProfile({
    //     member_id: member.id,
    //     attributes: {
    //       source: "Twitter",
    //       username: twitter_username,
    //     },
    //     workspace_id,
    //   });
    // }
  }

  return {
    member_id: profile?.member_id,
    headers,
  };
};

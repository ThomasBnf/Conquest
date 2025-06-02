import { createProfile } from "@conquest/clickhouse/profile/createProfile";
import { getProfile } from "@conquest/clickhouse/profile/getProfile";
import { updateProfile } from "@conquest/clickhouse/profile/updateProfile";
import { Profile } from "@conquest/zod/schemas/profile.schema";
import type { Octokit } from "octokit";
import { checkRateLimit } from "../github/checkRateLimit";

type Props = {
  octokit: Octokit;
  profile: Profile;
};

export const getGithubProfile = async ({ octokit, profile }: Props) => {
  const { externalId, workspaceId, memberId } = profile;

  const githubProfile = await octokit.rest.users.getByUsername({
    username: externalId,
  });

  const { headers, data } = githubProfile;
  const { bio, blog, followers, location, twitter_username } = data;

  await updateProfile({
    ...profile,
    attributes: {
      source: "Github",
      bio: bio ?? null,
      blog: blog ?? null,
      followers: followers ?? 0,
      location: location ?? null,
    },
  });

  if (twitter_username) {
    const twitterProfile = await getProfile({
      externalId: twitter_username,
      workspaceId,
    });

    if (!twitterProfile) {
      await createProfile({
        externalId: twitter_username,
        attributes: {
          source: "Twitter",
        },
        memberId,
        createdAt: new Date(),
        workspaceId,
      });
    }
  }

  await checkRateLimit(headers);
};

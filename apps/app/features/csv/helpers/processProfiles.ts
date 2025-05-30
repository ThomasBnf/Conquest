import { createProfile } from "@conquest/clickhouse/profile/createProfile";
import { getProfile } from "@conquest/clickhouse/profile/getProfile";
import { updateProfile } from "@conquest/clickhouse/profile/updateProfile";
import { Profile } from "@conquest/zod/schemas/profile.schema";

type Props = {
  memberId: string;
  memberData: Record<string, string>;
  workspaceId: string;
};

export const processProfiles = async ({
  memberId,
  memberData,
  workspaceId,
}: Props) => {
  const {
    discordId,
    discordUsername,
    discourseUsername,
    githubLogin,
    githubBio,
    githubFollowers,
    githubLocation,
    slackId,
    slackRealName,
    twitterUsername,
  } = memberData;

  const profiles: Profile[] = [];

  if (discordId && discordUsername) {
    const existingProfile = await getProfile({
      externalId: discordId,
      workspaceId,
    });

    const profile = existingProfile
      ? await updateProfile({
          id: existingProfile.id,
          attributes: {
            source: "Discord",
            username: discordUsername,
          },
        })
      : await createProfile({
          externalId: discordId,
          attributes: {
            source: "Discord",
            username: discordUsername,
          },
          memberId,
          workspaceId,
        });

    profiles.push(profile);
  }

  if (discourseUsername) {
    const existingProfile = await getProfile({
      externalId: discourseUsername,
      workspaceId,
    });

    const profile = existingProfile
      ? await updateProfile({
          id: existingProfile.id,
          externalId: discourseUsername,
        })
      : await createProfile({
          externalId: discourseUsername,
          attributes: {
            source: "Discourse",
          },
          memberId,
          workspaceId,
        });

    profiles.push(profile);
  }

  if (githubLogin) {
    const existingProfile = await getProfile({
      externalId: githubLogin,
      workspaceId,
    });

    const profile = existingProfile
      ? await updateProfile({
          id: existingProfile.id,
          attributes: {
            source: "Github",
            followers: Number(githubFollowers) ?? 0,
            bio: githubBio,
            blog: githubLocation,
          },
        })
      : await createProfile({
          externalId: githubLogin,
          attributes: {
            source: "Github",
            followers: Number(githubFollowers) ?? 0,
            bio: githubBio,
            blog: githubLocation,
          },
          memberId,
          workspaceId,
        });

    profiles.push(profile);
  }

  if (slackId && slackRealName) {
    const existingProfile = await getProfile({
      externalId: slackId,
      workspaceId,
    });

    const profile = existingProfile
      ? await updateProfile({
          id: existingProfile.id,
          attributes: {
            source: "Slack",
            displayName: slackRealName,
          },
        })
      : await createProfile({
          externalId: slackId,
          attributes: {
            source: "Slack",
            displayName: slackRealName,
          },
          memberId,
          workspaceId,
        });

    profiles.push(profile);
  }

  if (twitterUsername) {
    const existingProfile = await getProfile({
      externalId: twitterUsername,
      workspaceId,
    });

    const profile = existingProfile
      ? await updateProfile({
          id: existingProfile.id,
          externalId: twitterUsername,
        })
      : await createProfile({
          externalId: twitterUsername,
          attributes: {
            source: "Twitter",
          },
          memberId,
          workspaceId,
        });

    profiles.push(profile);
  }
};

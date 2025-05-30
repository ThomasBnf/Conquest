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
    discourseId,
    discourseUsername,
    githubId,
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

  if (discourseId && discourseUsername) {
    const existingProfile = await getProfile({
      externalId: discourseId,
      workspaceId,
    });

    const profile = existingProfile
      ? await updateProfile({
          id: existingProfile.id,
          attributes: {
            source: "Discourse",
            username: discourseUsername,
          },
        })
      : await createProfile({
          externalId: discourseId,
          attributes: {
            source: "Discourse",
            username: discourseUsername,
          },
          memberId,
          workspaceId,
        });

    profiles.push(profile);
  }

  if (githubId && githubLogin) {
    const existingProfile = await getProfile({
      externalId: githubId,
      workspaceId,
    });

    const profile = existingProfile
      ? await updateProfile({
          id: existingProfile.id,
          attributes: {
            source: "Github",
            login: githubLogin,
            followers: Number(githubFollowers) ?? 0,
            bio: githubBio,
            blog: githubLocation,
          },
        })
      : await createProfile({
          externalId: githubId,
          attributes: {
            source: "Github",
            login: githubLogin,
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
      username: twitterUsername,
      workspaceId,
    });

    const profile = existingProfile
      ? await updateProfile({
          id: existingProfile.id,
          attributes: {
            source: "Twitter",
            username: twitterUsername,
          },
        })
      : await createProfile({
          attributes: {
            source: "Twitter",
            username: twitterUsername,
          },
          memberId,
          workspaceId,
        });

    profiles.push(profile);
  }
};

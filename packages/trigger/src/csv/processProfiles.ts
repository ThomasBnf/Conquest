import { createProfile } from "@conquest/clickhouse/profile/createProfile";
import { getProfile } from "@conquest/clickhouse/profile/getProfile";
import { updateProfile } from "@conquest/clickhouse/profile/updateProfile";
import {
  DiscordProfileSchema,
  GithubProfileSchema,
  Profile,
  SlackProfileSchema,
} from "@conquest/zod/schemas/profile.schema";

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

  if (discordId) {
    const existingProfile = await getProfile({
      externalId: discordId,
      workspaceId,
    });

    if (existingProfile) {
      const {
        attributes: { username },
      } = DiscordProfileSchema.parse(existingProfile);

      profiles.push(
        await updateProfile({
          ...existingProfile,
          id: existingProfile.id,
          attributes: {
            source: "Discord",
            username: discordUsername || username || "",
          },
        }),
      );
    } else {
      profiles.push(
        await createProfile({
          externalId: discordId,
          attributes: {
            source: "Discord",
            username: discordUsername || "",
          },
          memberId,
          workspaceId,
        }),
      );
    }
  }

  if (discourseUsername) {
    const existingProfile = await getProfile({
      externalId: discourseUsername,
      workspaceId,
    });

    if (existingProfile) {
      profiles.push(existingProfile);
    } else {
      profiles.push(
        await createProfile({
          externalId: discourseUsername,
          attributes: {
            source: "Discourse",
          },
          memberId,
          workspaceId,
        }),
      );
    }
  }

  if (githubLogin) {
    const existingProfile = await getProfile({
      externalId: githubLogin,
      workspaceId,
    });

    if (existingProfile) {
      const {
        attributes: { followers, bio, blog },
      } = GithubProfileSchema.parse(existingProfile);

      profiles.push(
        await updateProfile({
          ...existingProfile,
          id: existingProfile.id,
          attributes: {
            source: "Github",
            followers: followers ?? Number(githubFollowers || 0),
            bio: bio ?? githubBio,
            blog: blog ?? githubLocation,
          },
        }),
      );
    } else {
      profiles.push(
        await createProfile({
          externalId: githubLogin,
          attributes: {
            source: "Github",
            followers: Number(githubFollowers || 0),
            bio: githubBio,
            blog: githubLocation,
          },
          memberId,
          workspaceId,
        }),
      );
    }
  }

  if (slackId && slackRealName) {
    const existingProfile = await getProfile({
      externalId: slackId,
      workspaceId,
    });

    if (existingProfile) {
      const {
        attributes: { realName },
      } = SlackProfileSchema.parse(existingProfile);

      profiles.push(
        await updateProfile({
          ...existingProfile,
          id: existingProfile.id,
          attributes: {
            source: "Slack",
            realName: realName ?? slackRealName,
          },
        }),
      );
    } else {
      profiles.push(
        await createProfile({
          externalId: slackId,
          attributes: {
            source: "Slack",
            realName: slackRealName,
          },
          memberId,
          workspaceId,
        }),
      );
    }
  }

  if (twitterUsername) {
    const existingProfile = await getProfile({
      externalId: twitterUsername,
      workspaceId,
    });

    const profile = existingProfile
      ? await updateProfile({
          ...existingProfile,
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

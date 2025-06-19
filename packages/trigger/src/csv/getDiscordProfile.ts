import { discordClient } from "@conquest/db/discord";
import { updateProfile } from "@conquest/db/profile/updateProfile";
import { Profile } from "@conquest/zod/schemas/profile.schema";
import { APIUser, Routes } from "discord-api-types/v10";

type Props = {
  profile: Profile;
};

export const getDiscordProfile = async ({ profile }: Props) => {
  const { externalId, workspaceId } = profile;

  const discordProfile = (await discordClient.get(
    `${Routes.user(externalId)}`,
  )) as APIUser;

  const { username } = discordProfile;

  return await updateProfile({
    ...profile,
    attributes: {
      source: "Discord",
      username,
    },
  });
};

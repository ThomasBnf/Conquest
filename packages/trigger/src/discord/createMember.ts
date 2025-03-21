import { createMember as _createMember } from "@conquest/clickhouse/members/createMember";
import { createProfile } from "@conquest/clickhouse/profiles/createProfile";
import { discordClient } from "@conquest/db/discord";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { logger } from "@trigger.dev/sdk/v3";
import { type APIUser, Routes } from "discord-api-types/v10";

type Props = {
  discord: DiscordIntegration;
  discord_id: string;
};

export const createMember = async ({ discord, discord_id }: Props) => {
  const { workspace_id } = discord;

  try {
    const owner = (await discordClient.get(Routes.user(discord_id))) as APIUser;
    logger.info("owner", { owner });

    console.log(owner);

    if (!owner) return;

    const { id, username, avatar, global_name, bot } = owner;

    if (bot) return;

    const parsedGlobalName = global_name?.replace("deleted_user", "");
    const firstName = parsedGlobalName?.split(" ")[0];
    const lastName = parsedGlobalName?.split(" ")[1];
    const avatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp`
      : "";

    const createdMember = await _createMember({
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl,
      source: "Discord",
      workspace_id,
    });

    await createProfile({
      external_id: id,
      attributes: {
        source: "Discord",
        username,
      },
      member_id: createdMember.id,
      workspace_id,
    });

    return createdMember;
  } catch (error) {
    logger.error("error", { error });

    return null;
  }
};

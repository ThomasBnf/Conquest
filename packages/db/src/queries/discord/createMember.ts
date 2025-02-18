import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { type APIUser, Routes } from "discord-api-types/v10";
import { discordClient } from "../../discord";
import { createMember as _createMember } from "../member/createMember";
import { upsertProfile } from "../profile/upsertProfile";

type Props = {
  discord: DiscordIntegration;
  discord_id: string;
};

export const createMember = async ({ discord, discord_id }: Props) => {
  const { workspace_id } = discord;

  const owner = (await discordClient.get(Routes.user(discord_id))) as APIUser;

  if (!owner) return;

  const { id, username, avatar, global_name, bot } = owner;

  if (bot) return;

  const parsedGlobalName = global_name?.replace("deleted_user", "");
  const firstName = parsedGlobalName?.split(" ")[0] ?? null;
  const lastName = parsedGlobalName?.split(" ")[1] ?? null;

  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp`
    : null;

  const createdMember = await _createMember({
    data: {
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl,
    },
    source: "DISCORD",
    workspace_id,
  });

  await upsertProfile({
    external_id: id,
    attributes: {
      source: "DISCORD",
      username,
    },
    member_id: createdMember.id,
    workspace_id,
  });

  return createdMember;
};

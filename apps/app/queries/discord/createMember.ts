import { discordClient } from "@/lib/discord";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { type APIUser, Routes } from "discord-api-types/v10";
import { upsertMember } from "../members/upsertMember";

type Props = {
  discord: DiscordIntegration;
  discord_id: string;
};

export const createMember = async ({ discord, discord_id }: Props) => {
  const { workspace_id } = discord;

  try {
    const owner = (await discordClient.get(Routes.user(discord_id))) as APIUser;

    if (!owner) return null;

    const { id, username, avatar, global_name } = owner;

    const parsedGlobalName = global_name?.replace("deleted_user", "");
    const firstName = parsedGlobalName?.split(" ")[0] ?? null;
    const lastName = parsedGlobalName?.split(" ")[1] ?? null;

    const avatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp`
      : null;

    const member = await upsertMember({
      id,
      data: {
        first_name: firstName,
        last_name: lastName,
        discord_username: username,
        avatar_url: avatarUrl,
        created_at: new Date(),
      },
      source: "DISCORD",
      workspace_id,
    });

    return MemberSchema.parse(member);
  } catch (error) {
    console.error("Error creating member", error);
    return null;
  }
};

import { createMember } from "@conquest/clickhouse/members/createMember";
import { createProfile } from "@conquest/clickhouse/profiles/createProfile";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { type APIGuildMember, Routes } from "discord-api-types/v10";
import { discordClient } from "../discord";

type Props = {
  discord: DiscordIntegration;
  tags: Tag[] | undefined;
};

export const createManyMembers = async ({ discord, tags }: Props) => {
  const { external_id, workspace_id } = discord;

  if (!external_id) return;

  let after: string | undefined;

  while (true) {
    const members = (await discordClient.get(
      `${Routes.guildMembers(external_id)}?limit=100${
        after ? `&after=${after}` : ""
      }`,
    )) as APIGuildMember[];

    for (const member of members) {
      const { user, joined_at, roles } = member;
      const { id, username, avatar, global_name, bot } = user;

      if (bot) continue;

      const firstName = global_name?.split(" ")[0];
      const lastName = global_name?.split(" ")[1];

      const memberTags = tags
        ?.filter((tag) => roles.includes(tag.external_id ?? ""))
        .map((tag) => tag.id);

      const avatarUrl = avatar
        ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp`
        : "";

      const createdMember = await createMember({
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        tags: memberTags,
        created_at: new Date(joined_at),
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
    }

    after = members.at(-1)?.user.id;

    if (members.length < 100) break;
  }
};

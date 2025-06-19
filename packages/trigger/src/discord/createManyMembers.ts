import { createMember } from "@conquest/db/member/createMember";
import { createProfile } from "@conquest/db/profile/createProfile";
import { discordClient } from "@conquest/db/discord";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { logger } from "@trigger.dev/sdk/v3";
import { type APIGuildMember, Routes } from "discord-api-types/v10";

type Props = {
  discord: DiscordIntegration;
  tags: Tag[] | undefined;
};

export const createManyMembers = async ({ discord, tags }: Props) => {
  const { externalId, workspaceId } = discord;

  if (!externalId) return;

  let after: string | undefined;

  while (true) {
    const members = (await discordClient.get(
      `${Routes.guildMembers(externalId)}?limit=100${
        after ? `&after=${after}` : ""
      }`,
    )) as APIGuildMember[];

    logger.info("members", { count: members.length, members });

    for (const member of members) {
      const { user, joined_at, roles } = member;
      const { id, username, avatar, global_name, bot } = user;

      if (bot) {
        logger.info("bot", { user });
        continue;
      }

      const firstName = global_name?.split(" ")[0];
      const lastName = global_name?.split(" ")[1];

      const memberTags = tags
        ?.filter((tag) => roles.includes(tag.externalId ?? ""))
        .map((tag) => tag.id);

      const avatarUrl = avatar
        ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp`
        : "";

      const createdMember = await createMember({
        firstName,
        lastName,
        avatarUrl,
        tags: memberTags,
        createdAt: new Date(joined_at),
        source: "Discord",
        workspaceId,
      });

      await createProfile({
        externalId: id,
        attributes: {
          source: "Discord",
          username,
        },
        memberId: createdMember.id,
        workspaceId,
      });
    }

    if (members.length < 100) break;
    after = members.at(-1)?.user.id;
  }
};

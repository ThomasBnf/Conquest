import { discordClient } from "@conquest/db/discord";
import { createTag } from "@conquest/db/tags/createTag";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { type APIRole, Routes } from "discord-api-types/v10";

type Props = {
  discord: DiscordIntegration;
};

export const createManyTags = async ({ discord }: Props) => {
  const { externalId, workspaceId } = discord;

  if (!externalId) return;

  const roles = (await discordClient.get(
    Routes.guildRoles(externalId),
  )) as APIRole[];

  const filteredRoles = roles.filter(
    (role) => !["Conquest", "conquest-sandbox"].includes(role.name),
  );

  const tags: Tag[] = [];

  for (const role of filteredRoles) {
    const { id, name, color } = role;

    const decimalToHex = (decimal: number) =>
      `#${decimal.toString(16).padStart(6, "0")}`;

    const parsedColor = decimalToHex(color);

    const tag = await createTag({
      externalId: id,
      name,
      color: parsedColor,
      source: "Discord",
      workspaceId,
    });

    tags.push(tag);
  }

  return tags;
};

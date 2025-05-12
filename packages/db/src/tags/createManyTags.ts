import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { type APIRole, Routes } from "discord-api-types/v10";
import { v4 as uuid } from "uuid";
import { discordClient } from "../discord";
import { createTag } from "./createTag";

type Props = {
  discord: DiscordIntegration;
};

export const createManyTags = async ({ discord }: Props) => {
  const { externalId, workspaceId } = discord;

  if (!externalId) return;

  const roles = (await discordClient.get(
    Routes.guildRoles(externalId),
  )) as APIRole[];

  const tags: Tag[] = [];

  for (const role of roles) {
    const { id, name, color } = role;

    if (["Conquest", "conquest-sandbox"].includes(name)) continue;

    const decimalToHex = (decimal: number) =>
      `#${decimal.toString(16).padStart(6, "0")}`;

    const parsedColor = decimalToHex(color);

    const tag = await createTag({
      id: uuid(),
      externalId: id,
      name,
      color: parsedColor,
      source: "Discord",
      workspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    tags.push(tag);
  }

  return tags;
};

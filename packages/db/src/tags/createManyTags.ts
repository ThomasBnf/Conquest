import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { type APIRole, Routes } from "discord-api-types/v10";
import { discordClient } from "../discord";
import { createTag } from "./createTag";

type Props = {
  discord: DiscordIntegration;
};

export const createManyTags = async ({ discord }: Props) => {
  const { external_id, workspace_id } = discord;

  if (!external_id) return;

  const roles = (await discordClient.get(
    Routes.guildRoles(external_id),
  )) as APIRole[];

  const tags: Tag[] = [];

  for (const role of roles) {
    const { id, name, color } = role;

    if (["Conquest", "conquest-sandbox"].includes(name)) continue;

    const decimalToHex = (decimal: number) =>
      `#${decimal.toString(16).padStart(6, "0")}`;

    const parsedColor = decimalToHex(color);

    const tag = await createTag({
      external_id: id,
      name,
      color: parsedColor,
      source: "Discord",
      workspace_id: workspace_id,
    });

    tags.push(tag);
  }

  return tags;
};

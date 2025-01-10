import { discordClient } from "@/lib/discord";
import { createTag } from "@/queries/tags/createTag";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { DiscordAPIError } from "@discordjs/rest";
import { type APIRole, Routes } from "discord-api-types/v10";

type Props = {
  discord: DiscordIntegration;
};

export const createManyTags = async ({ discord }: Props) => {
  const { external_id, workspace_id } = discord;

  if (!external_id) return;

  try {
    const roles = (await discordClient.get(
      Routes.guildRoles(external_id),
    )) as APIRole[];

    const tags: Tag[] = [];

    for (const role of roles) {
      try {
        const { id, name, color } = role;

        const decimalToHex = (decimal: number) =>
          `#${decimal.toString(16).padStart(6, "0")}`;

        const parsedColor = decimalToHex(color);

        const tag = await createTag({
          external_id: id,
          name,
          color: parsedColor,
          source: "DISCORD",
          workspace_id: workspace_id,
        });

        tags.push(tag);
      } catch (error) {
        if (error instanceof DiscordAPIError) {
          console.error(
            `Failed to create tag for role ${role.id}:`,
            error.rawError,
          );
        } else {
          console.error("@Error creating tag:", error);
        }
      }
    }

    return tags;
  } catch (error) {
    if (error instanceof DiscordAPIError) {
      console.error("Failed to fetch Discord roles:", error.rawError);
    }
    return [];
  }
};

import { discordClient } from "@conquest/db/discord";
import { Channel } from "@conquest/zod/schemas/channel.schema";
import { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { logger } from "@trigger.dev/sdk/v3";
import { APIRole, Routes } from "discord-api-types/v10";

type Props = {
  discord: DiscordIntegration;
  channel: Channel;
};

export const checkPermissions = async ({ discord, channel }: Props) => {
  const { externalId: guildId } = discord;
  const { externalId } = channel;

  if (!guildId || !externalId) return;

  const roles = (await discordClient.get(
    Routes.guildRoles(guildId),
  )) as APIRole[];

  const isDevMode = process.env.NODE_ENV === "development";
  const botName = isDevMode ? "conquest-sandbox" : "Conquest";

  const conquest = roles.find((role) => role.name === botName)?.id;

  if (!conquest) return;

  const VIEW_CHANNEL = 1 << 10;
  const READ_MESSAGE_HISTORY = 1 << 16;

  const allow = VIEW_CHANNEL | READ_MESSAGE_HISTORY;

  try {
    await discordClient.put(Routes.channelPermission(externalId, conquest), {
      body: {
        allow: allow.toString(),
        type: 0,
      },
    });
  } catch (error) {
    logger.error("checkPermissions error", { error });
  }
};

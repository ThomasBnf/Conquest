import { discordClient } from "@conquest/db/discord";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { getRefreshToken } from "@conquest/trigger/discord/getRefreshToken";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import {
  type APIGuildCategoryChannel,
  type APIRole,
  ChannelType,
  Routes,
} from "discord-api-types/v10";
import { protectedProcedure } from "../trpc";

const EXCLUDED_CHANNEL_TYPES = [
  ChannelType.GuildStageVoice,
  ChannelType.GuildVoice,
] as number[];

export const listChannels = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const discord = DiscordIntegrationSchema.parse(
      await getIntegrationBySource({
        source: "Discord",
        workspace_id,
      }),
    );

    const { external_id, details } = discord;
    const { expires_in } = details;

    const isExpired = new Date(Date.now() + expires_in * 1000) < new Date();
    if (isExpired) await getRefreshToken({ discord });

    if (!external_id) return [];

    const roles = (await discordClient.get(
      Routes.guildRoles(external_id),
    )) as APIRole[];

    const channels = (await discordClient.get(
      Routes.guildChannels(external_id),
    )) as APIGuildCategoryChannel[];

    console.dir(channels, { depth: null });

    const filteredChannels = channels.filter((channel) => {
      if (EXCLUDED_CHANNEL_TYPES.includes(channel.type)) return false;

      // Include categories
      if (channel.type === ChannelType.GuildCategory) return true;

      const everyoneRole = roles.find((role) => role.name === "@everyone");

      // If no permission_overwrites, the channel is public
      if (
        !channel.permission_overwrites ||
        channel.permission_overwrites.length === 0
      ) {
        return true;
      }

      // Check if @everyone role has restrictions
      const everyoneOverwrite = channel.permission_overwrites.find(
        (overwrite) => overwrite.id === everyoneRole?.id,
      );

      // If no specific restriction for @everyone, the channel is public
      if (!everyoneOverwrite) {
        return true;
      }

      const VIEW_CHANNEL = BigInt(1) << BigInt(10);
      const READ_MESSAGE_HISTORY = BigInt(1) << BigInt(16);

      // Check if read permissions are explicitly denied
      const denyBits = BigInt(everyoneOverwrite.deny ?? 0);
      const isViewDenied = (denyBits & VIEW_CHANNEL) !== 0n;
      const isHistoryDenied = (denyBits & READ_MESSAGE_HISTORY) !== 0n;

      // The channel is public if no read permission is denied
      return !isViewDenied && !isHistoryDenied;
    });

    return filteredChannels;
  },
);

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

    const filteredChannels = channels.filter((channel) => {
      if (EXCLUDED_CHANNEL_TYPES.includes(channel.type)) return false;
      if (channel.type === ChannelType.GuildCategory) return true;

      const everyoneRole = roles.find((role) => role.name === "@everyone");
      const conquestRole = roles.find(
        (role) => role.name === "conquest-sandbox",
      );

      const { permission_overwrites } = channel;

      const basePermissions = BigInt(everyoneRole?.permissions ?? 0);
      const VIEW_CHANNEL = BigInt(1) << BigInt(10);
      const READ_MESSAGE_HISTORY = BigInt(1) << BigInt(16);

      // Start with base permissions check
      let canViewChannel = (basePermissions & VIEW_CHANNEL) !== 0n;
      let canReadHistory = (basePermissions & READ_MESSAGE_HISTORY) !== 0n;

      const everyonePermission = permission_overwrites?.find(
        (overwrite) => overwrite.id === everyoneRole?.id,
      );

      const conquestPermission = permission_overwrites?.find(
        (overwrite) => overwrite.id === conquestRole?.id,
      );

      if (everyonePermission) {
        const everyoneAllow = BigInt(everyonePermission.allow ?? 0);
        const everyoneDeny = BigInt(everyonePermission.deny ?? 0);

        // Check if @everyone denies permissions
        const isViewDenied = (everyoneDeny & VIEW_CHANNEL) !== 0n;
        const isHistoryDenied = (everyoneDeny & READ_MESSAGE_HISTORY) !== 0n;

        // Update permissions based on @everyone role
        canViewChannel = isViewDenied
          ? false
          : (everyoneAllow & VIEW_CHANNEL) !== 0n || canViewChannel;
        canReadHistory = isHistoryDenied
          ? false
          : (everyoneAllow & READ_MESSAGE_HISTORY) !== 0n || canReadHistory;

        // If permissions are denied by @everyone, check if conquest role explicitly allows them
        if (conquestPermission) {
          const conquestAllow = BigInt(conquestPermission.allow ?? 0);

          if (isViewDenied) {
            canViewChannel = (conquestAllow & VIEW_CHANNEL) !== 0n;
          }
          if (isHistoryDenied) {
            canReadHistory = (conquestAllow & READ_MESSAGE_HISTORY) !== 0n;
          }
        }
      }

      // Return true only if both permissions are granted
      return canViewChannel && canReadHistory;
    });

    return filteredChannels;
  },
);

import { discordClient } from "@conquest/db/discord";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { getRefreshToken } from "@conquest/trigger/discord/getRefreshToken";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import {
  type APIGuildCategoryChannel,
  APIRole,
  ChannelType,
  Routes,
} from "discord-api-types/v10";
import { protectedProcedure } from "../trpc";

const EXCLUDED_CHANNEL_TYPES = [
  ChannelType.GuildStageVoice,
  ChannelType.GuildVoice,
] as number[];

const VIEW_CHANNEL = 1 << 10;

export const listChannels = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    const discord = DiscordIntegrationSchema.parse(
      await getIntegrationBySource({
        source: "Discord",
        workspaceId,
      }),
    );

    const { externalId, details } = discord;
    const { expiresIn } = details;

    const isExpired = new Date(Date.now() + expiresIn * 1000) < new Date();
    if (isExpired) await getRefreshToken({ discord });

    if (!externalId) return [];

    const roles = (await discordClient.get(
      Routes.guildRoles(externalId),
    )) as APIRole[];

    const isDev = process.env.NODE_ENV === "development";
    const botName = isDev ? "conquest-sandbox" : "Conquest";

    const conquest = roles.find((role) => role.name === botName)?.id;
    const everyone = roles.find((role) => role.name === "@everyone")?.id;

    const channels = (await discordClient.get(
      Routes.guildChannels(externalId),
    )) as APIGuildCategoryChannel[];

    const filteredChannels = channels.filter((channel) => {
      if (EXCLUDED_CHANNEL_TYPES.includes(channel.type)) return false;
      if (channel.type === ChannelType.GuildCategory) return true;

      if (!channel.permission_overwrites) return false;

      const conquestPermission = channel.permission_overwrites.find(
        (permission) => permission.id === conquest,
      );

      const everyonePermission = channel.permission_overwrites.find(
        (permission) => permission.id === everyone,
      );

      const canView = (
        permission: { allow: string; deny: string } | undefined,
      ) => {
        if (!permission) return false;
        const deny = BigInt(permission.deny);

        return (deny & BigInt(VIEW_CHANNEL)) !== BigInt(VIEW_CHANNEL);
      };

      return canView(conquestPermission) || canView(everyonePermission);
    });

    return filteredChannels;
  },
);

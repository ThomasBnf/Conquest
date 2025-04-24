import { discordClient } from "@conquest/db/discord";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { getRefreshToken } from "@conquest/trigger/discord/getRefreshToken";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import {
  type APIGuildCategoryChannel,
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

    const channels = (await discordClient.get(
      Routes.guildChannels(external_id),
    )) as APIGuildCategoryChannel[];

    const filteredChannels = channels.filter((channel) => {
      if (EXCLUDED_CHANNEL_TYPES.includes(channel.type)) return false;
      if (channel.type === ChannelType.GuildCategory) return true;

      return true;
    });

    return filteredChannels;
  },
);

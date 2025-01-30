import {
  type APIGuildCategoryChannel,
  ChannelType,
  PermissionFlagsBits,
} from "discord-api-types/v10";

export const EXCLUDED_CHANNEL_TYPES = [
  ChannelType.GuildStageVoice,
  ChannelType.GuildVoice,
] as number[];

const VIEW_CHANNEL_PERMISSION = BigInt(PermissionFlagsBits.ViewChannel);
const HAS_HISTORY_PERMISSION = BigInt(PermissionFlagsBits.ReadMessageHistory);

export const hasPermission = (channel: APIGuildCategoryChannel) => {
  return !channel.permission_overwrites?.some(
    (permission) =>
      (BigInt(permission.deny) & VIEW_CHANNEL_PERMISSION) ===
        VIEW_CHANNEL_PERMISSION &&
      (BigInt(permission.deny) & HAS_HISTORY_PERMISSION) ===
        HAS_HISTORY_PERMISSION,
  );
};

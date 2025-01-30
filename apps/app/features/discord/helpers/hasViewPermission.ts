import {
  type APIGuildCategoryChannel,
  PermissionFlagsBits,
} from "discord-api-types/v10";

const VIEW_CHANNEL_PERMISSION = BigInt(PermissionFlagsBits.ViewChannel);

export const hasViewPermission = (channel: APIGuildCategoryChannel) => {
  return !channel.permission_overwrites?.some(
    (permission) =>
      (BigInt(permission.deny) & VIEW_CHANNEL_PERMISSION) ===
      VIEW_CHANNEL_PERMISSION,
  );
};

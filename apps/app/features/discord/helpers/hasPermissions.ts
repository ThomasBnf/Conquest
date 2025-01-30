import {
  type APIGuildCategoryChannel,
  ChannelType,
  PermissionFlagsBits,
} from "discord-api-types/v10";

export const EXCLUDED_CHANNEL_TYPES = [
  ChannelType.GuildStageVoice,
  ChannelType.GuildVoice,
] as number[];

const REQUIRED_PERMISSIONS = {
  view: BigInt(PermissionFlagsBits.ViewChannel),
  history: BigInt(PermissionFlagsBits.ReadMessageHistory),
} as const;

const hasRequiredPermission = (
  permission: bigint,
  requiredPermission: bigint,
) => (permission & requiredPermission) === requiredPermission;

export const hasPermission = (channel: APIGuildCategoryChannel) => {
  if (!channel.permission_overwrites?.length) return true;

  return channel.permission_overwrites.every((permission) => {
    const allow = BigInt(permission.allow);
    const deny = BigInt(permission.deny);

    const hasAllowedView = hasRequiredPermission(
      allow,
      REQUIRED_PERMISSIONS.view,
    );
    const hasAllowedHistory = hasRequiredPermission(
      allow,
      REQUIRED_PERMISSIONS.history,
    );
    const hasDeniedView = hasRequiredPermission(
      deny,
      REQUIRED_PERMISSIONS.view,
    );
    const hasDeniedHistory = hasRequiredPermission(
      deny,
      REQUIRED_PERMISSIONS.history,
    );

    return (
      hasAllowedView ||
      hasAllowedHistory ||
      (!hasDeniedView && !hasDeniedHistory)
    );
  });
};

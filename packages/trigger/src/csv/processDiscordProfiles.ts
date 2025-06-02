import { getProfile } from "@conquest/clickhouse/profile/getProfile";
import { getDiscordProfile } from "./getDiscordProfile";

type Props = {
  members: Record<string, string>[];
  workspaceId: string;
};

export const processDiscordProfiles = async ({
  members,
  workspaceId,
}: Props) => {
  const discordMembers = members.filter(
    (member) => member.discordId && member.discordId.trim() !== "",
  );

  for (const member of discordMembers) {
    const { discordId } = member;

    if (!discordId) continue;

    const profile = await getProfile({
      externalId: discordId,
      workspaceId,
    });

    if (profile) await getDiscordProfile({ profile });
  }
};

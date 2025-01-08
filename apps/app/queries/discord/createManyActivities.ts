import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { listChannelMessages } from "./listChannelMessages";

type Props = {
  discord: DiscordIntegration;
  channel: Channel;
};

export const createManyActivities = async ({ discord, channel }: Props) => {
  const { workspace_id } = discord;

  const { external_id } = channel;

  if (!external_id) return;

  let after: string | undefined = undefined;
  let hasMore = true;

  while (hasMore) {
    const messages = await listChannelMessages({
      channel_id: external_id,
      channel,
      workspace_id,
      after,
    });

    if (messages.length < 100) {
      hasMore = false;
    } else {
      after = messages.at(-1)?.id;
    }
  }
};

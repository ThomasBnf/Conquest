import { discordClient } from "@/lib/discord";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import {
  type APIGuildCategoryChannel,
  type APIThreadList,
  Routes,
} from "discord-api-types/v10";
import { createChannel } from "../channels/createChannel";
import { listChannelMessages } from "./listChannelMessages";
import { createManyArchivedThreads } from "./createManyArchivedThreads";

type Props = {
  discord: DiscordIntegration;
  channels: APIGuildCategoryChannel[];
};

export const createManyChannels = async ({ discord, channels }: Props) => {
  const { external_id, workspace_id } = discord;

  if (!external_id) return;

  for (const channel of channels) {
    const { id, name } = channel;

    const createdChannel = await createChannel({
      external_id: id,
      name,
      source: "DISCORD",
      workspace_id,
    });

    let after: string | undefined = undefined;

    while (true) {
      const messages = await listChannelMessages({
        channel_id: id,
        channel: createdChannel,
        workspace_id,
        after,
      });

      after = messages.at(-1)?.id;

      if (messages.length < 100) break;
    }

    await createManyArchivedThreads({ discord, channel: createdChannel });
  }
};

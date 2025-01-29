import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import type { APIGuildCategoryChannel } from "discord-api-types/v10";
import { createChannel } from "../channels/createChannel";

type Props = {
  discord: DiscordIntegration;
  channels: APIGuildCategoryChannel[];
};

export const createManyChannels = async ({ discord, channels }: Props) => {
  const { external_id, workspace_id } = discord;

  if (!external_id) return;

  let createdChannels: Channel[] = [];

  for (const channel of channels) {
    const { id, name } = channel;

    const createdChannel = await createChannel({
      external_id: id,
      name,
      source: "DISCORD",
      workspace_id,
    });

    createdChannels = [...createdChannels, createdChannel];
  }

  return createdChannels;
};

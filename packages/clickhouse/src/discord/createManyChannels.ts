import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { Integration } from "@conquest/zod/schemas/integration.schema";
import type { APIGuildCategoryChannel } from "discord-api-types/v10";
import { createChannel } from "../channels/createChannel";

type Props = {
  integration: Integration;
  channels: APIGuildCategoryChannel[];
};

export const createManyChannels = async ({ integration, channels }: Props) => {
  const { external_id, workspace_id } = integration;

  if (!external_id) return;

  let createdChannels: Channel[] = [];

  for (const channel of channels) {
    const { id, name } = channel;

    const createdChannel = await createChannel({
      external_id: id,
      name,
      source: "Discord",
      workspace_id,
    });

    createdChannels = [...createdChannels, createdChannel];
  }

  return createdChannels;
};

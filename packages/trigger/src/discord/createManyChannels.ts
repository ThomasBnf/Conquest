import { createChannel } from "@conquest/clickhouse/channel/createChannel";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { Integration } from "@conquest/zod/schemas/integration.schema";
import type { APIGuildCategoryChannel } from "discord-api-types/v10";

type Props = {
  integration: Integration;
  channels: APIGuildCategoryChannel[];
};

export const createManyChannels = async ({ integration, channels }: Props) => {
  const { externalId, workspaceId } = integration;

  if (!externalId) return;

  let createdChannels: Channel[] = [];

  for (const channel of channels) {
    const { id, name } = channel;

    const createdChannel = await createChannel({
      externalId: id,
      name,
      source: "Discord",
      workspaceId,
    });

    if (!createdChannel) continue;

    createdChannels = [...createdChannels, createdChannel];
  }

  return createdChannels;
};

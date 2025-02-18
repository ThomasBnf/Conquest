import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { WebClient } from "@slack/web-api";
import { createChannel } from "../channel/createChannel";

type Props = {
  web: WebClient;
  token: string;
  workspace_id: string;
  channels: string[];
};

export const createListChannels = async ({
  web,
  token,
  workspace_id,
  channels,
}: Props) => {
  const listOfChannels: Channel[] = [];

  for (const channelId of channels) {
    const { channel } = await web.conversations.info({
      channel: channelId,
      token,
    });

    const { name, id } = channel ?? {};

    if (!name || !id) continue;

    const createdChannel = await createChannel({
      name: name,
      source: "SLACK",
      external_id: id,
      workspace_id,
    });

    if (!createdChannel) continue;

    await web.conversations.join({
      channel: createdChannel.external_id ?? "",
      token,
    });

    listOfChannels.push(createdChannel);
  }

  return listOfChannels;
};

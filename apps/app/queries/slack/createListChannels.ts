import { createChannel } from "@/features/channels/functions/createChannel";
import { listMessages } from "@/features/slack/functions/listMessages";
import type { WebClient } from "@slack/web-api";

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
  for (const channelId of channels) {
    const { channel } = await web.conversations.info({
      channel: channelId,
      token,
    });

    const { name, id } = channel ?? {};

    if (!name || !id) continue;

    const rChannel = await createChannel({
      name: name,
      source: "SLACK",
      external_id: id,
      workspace_id,
    });
    const createdChannel = rChannel?.data;

    if (!createdChannel) continue;

    await web.conversations.join({
      channel: createdChannel.external_id ?? "",
      token,
    });

    await listMessages({ web, channel: createdChannel, workspace_id });
  }
};

import { createChannel } from "@/queries/channels/createChannel";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import { WebClient } from "@slack/web-api";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const createListChannels = schemaTask({
  id: "create-list-channels",
  machine: {
    preset: "small-2x",
  },
  schema: z.object({
    token: z.string(),
    channels: z.array(z.string()),
    workspace_id: z.string(),
  }),
  run: async ({ channels, token, workspace_id }) => {
    const web = new WebClient(token);

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
  },
});

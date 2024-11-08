import { createChannel } from "@/features/channels/functions/createChannel";
import { listMessages } from "@/features/slack/functions/listMessages";
import { WebClient } from "@slack/web-api";
import { inngest } from "../client";

export const InngestCreateListChannels = inngest.createFunction(
  { id: "create-list-channels" },
  { event: "slack/create-list-channels" },
  async ({ event }) => {
    const { workspace_id, token } = event.data;

    const web = new WebClient(token);

    let cursor: string | undefined;

    do {
      const { channels, response_metadata } = await web.conversations.list({
        limit: 100,
        cursor,
        types: "public_channel,private_channel",
        exclude_archived: true,
      });

      for (const channel of channels ?? []) {
        const { name, id } = channel;

        if (!name || !id) return;

        const rChannel = await createChannel({
          name: name,
          source: "SLACK",
          external_id: id,
          workspace_id,
        });
        const createdChannel = rChannel?.data;

        if (!createdChannel) return;

        await web.conversations.join({
          channel: createdChannel.external_id ?? "",
          token,
        });

        await listMessages({ web, channel: createdChannel, workspace_id });
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);

    return { success: true };
  },
);

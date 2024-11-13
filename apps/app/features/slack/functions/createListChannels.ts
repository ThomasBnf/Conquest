import { createChannel } from "@/features/channels/functions/createChannel";
import { listMessages } from "@/features/slack/functions/listMessages";
import { safeAction } from "@/lib/safeAction";
import { WebClient } from "@slack/web-api";
import { z } from "zod";

export const createListChannels = safeAction
  .metadata({
    name: "createListChannels",
  })
  .schema(
    z.object({
      web: z.instanceof(WebClient),
      token: z.string(),
      workspace_id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { web, token, workspace_id } }) => {
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

      cursor = response_metadata?.next_cursor;
    } while (cursor);
  });

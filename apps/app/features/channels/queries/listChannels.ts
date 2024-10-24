import { createChannel } from "@/features/channels/queries/createChannel";
import { listMessages } from "@/features/slack/queries/listMessages";
import { authAction } from "@/lib/authAction";
import { WebClient } from "@slack/web-api";
import { z } from "zod";

export const listChannels = authAction
  .metadata({
    name: "listChannels",
  })
  .schema(
    z.object({
      web: z.instanceof(WebClient),
      token: z.string(),
    }),
  )
  .action(async ({ parsedInput: { web, token } }) => {
    let cursor: string | undefined;

    do {
      const { channels, response_metadata } = await web.conversations.list({
        limit: 100,
        cursor,
        types: "public_channel,private_channel",
      });

      for (const channel of channels ?? []) {
        const { name, id } = channel;

        if (!name || !id) continue;

        const rChannel = await createChannel({
          external_id: id,
          name: name,
          source: "SLACK",
        });
        const createdChannel = rChannel?.data;

        if (!createdChannel) continue;

        await web.conversations.join({
          channel: createdChannel.external_id ?? "",
          token,
        });

        await listMessages({ web, channel: createdChannel });
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);
  });

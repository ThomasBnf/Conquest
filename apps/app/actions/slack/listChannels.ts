"use server";

import { WebClient } from "@slack/web-api";
import { authAction } from "lib/authAction";
import { z } from "zod";
import { createChannel } from "../channels/createChannel";
import { listMessages } from "./listMessages";

export const listChannels = authAction
  .metadata({
    name: "listChannels",
  })
  .schema(
    z.object({
      web: z.instanceof(WebClient),
    }),
  )
  .action(async ({ parsedInput: { web } }) => {
    let cursor: string | undefined;

    do {
      const { channels, response_metadata } = await web.conversations.list({
        limit: 100,
        cursor,
        types: "public_channel,private_channel",
      });

      for (const channel of channels ?? []) {
        if (!channel.name) continue;

        const rChannel = await createChannel({
          name: channel.name,
          external_id: channel.id ?? null,
        });
        const createdChannel = rChannel?.data;

        if (!createdChannel) continue;

        await listMessages({ web, channel: createdChannel });
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);
  });

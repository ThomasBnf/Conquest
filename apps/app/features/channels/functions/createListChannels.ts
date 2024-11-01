import { listMessages } from "@/features/slack/queries/listMessages";
import { authAction } from "@/lib/authAction";
import { WebClient } from "@slack/web-api";
import { z } from "zod";
import { createChannel } from "./createChannel";

export const createListChannels = authAction
  .metadata({
    name: "createListChannels",
  })
  .schema(
    z.object({
      web: z.instanceof(WebClient),
      token: z.string(),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { web, token } }) => {
    let cursor: string | undefined;
    const workspace_id = user.workspace_id;

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

        await listMessages({ web, channel: createdChannel });
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);
  });

"use server";

import { authAction } from "@/lib/authAction";
import { createManyChannels } from "@/queries/discord/createManyChannels";
import { createManyTags } from "@/queries/discord/createManyTags";
import { createManyThreads } from "@/queries/discord/createManyThreads";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { APIGuildCategoryChannel } from "discord-api-types/v10";
import { z } from "zod";

export const action = authAction
  .metadata({
    name: "action",
  })
  .schema(
    z.object({
      discord: DiscordIntegrationSchema,
      channels: z.array(z.custom<APIGuildCategoryChannel>()),
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { discord, channels } }) => {
    const workspace_id = user.workspace_id;

    const { external_id } = discord;

    if (!external_id) return;

    // await createManyActivityTypes({
    //   activity_types: DISCORD_ACTIVITY_TYPES,
    //   workspace_id,
    // });

    console.log("@ start installing discord @");

    const tags = await createManyTags({ discord });

    // await createManyMembers({ discord, tags });
    const createdChannels = await createManyChannels({ discord, channels });
    await createManyThreads({ discord });

    // for (const channel of createdChannels ?? []) {
    //   await createManyArchivedThreads({ discord, channel });

    // if (!channel.external_id) continue;

    // let after: string | undefined;

    // while (true) {
    //   const messages = await listChannelMessages({
    //     channel_id: channel.external_id,
    //     channel,
    //     workspace_id,
    //     after,
    //   });

    //   after = messages.at(-1)?.id;

    //   if (messages.length < 100) break;
    // }
    // }
  });

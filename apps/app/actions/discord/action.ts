"use server";

import { DISCORD_ACTIVITY_TYPES } from "@/constant";
import { authAction } from "@/lib/authAction";
import { createManyActivityTypes } from "@/queries/activity-type/createManyActivityTypes";
import { createManyChannels } from "@/queries/discord/createManyChannels";
import { createManyMembers } from "@/queries/discord/createManyMembers";
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

    await createManyActivityTypes({
      activity_types: DISCORD_ACTIVITY_TYPES,
      workspace_id,
    });

    const tags = await createManyTags({ discord });

    await createManyMembers({ discord, tags });
    await createManyChannels({ discord, channels });
    await createManyThreads({ discord });
  });

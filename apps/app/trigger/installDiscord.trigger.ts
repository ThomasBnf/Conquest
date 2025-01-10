import { DISCORD_ACTIVITY_TYPES } from "@/constant";
import { createManyActivityTypes } from "@/queries/activity-type/createManyActivityTypes";
import { createManyArchivedThreads } from "@/queries/discord/createManyArchivedThreads";
import { createManyChannels } from "@/queries/discord/createManyChannels";
import { createManyMembers } from "@/queries/discord/createManyMembers";
import { createManyTags } from "@/queries/discord/createManyTags";
import { createManyThreads } from "@/queries/discord/createManyThreads";
import { listChannelMessages } from "@/queries/discord/listChannelMessages";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import type { APIGuildCategoryChannel } from "discord-api-types/v10";
import { z } from "zod";
import { calculateMembersLevel } from "./calculateMembersLevel";

export const installDiscord = schemaTask({
  id: "install-discord",
  machine: {
    preset: "small-2x",
  },
  schema: z.object({
    discord: DiscordIntegrationSchema,
    channels: z.array(z.custom<APIGuildCategoryChannel>()),
  }),
  retry: {
    maxAttempts: 1,
  },
  run: async ({ discord, channels }) => {
    const { workspace_id, external_id, details } = discord;

    if (!external_id) return;

    await updateIntegration({
      id: discord.id,
      status: "SYNCING",
    });

    await createManyActivityTypes({
      activity_types: DISCORD_ACTIVITY_TYPES,
      workspace_id,
    });

    console.log("@ start installing discord @");

    const tags = await createManyTags({ discord });

    await createManyMembers({ discord, tags });
    const createdChannels = await createManyChannels({ discord, channels });
    await createManyThreads({ discord });

    for (const channel of createdChannels ?? []) {
      await createManyArchivedThreads({ discord, channel });

      if (!channel.external_id) continue;

      await listChannelMessages({
        discord,
        channel_id: channel.external_id,
        channel,
        workspace_id,
      });
    }

    calculateMembersLevel.trigger({ workspace_id });
  },
  onSuccess: async ({ discord }) => {
    await updateIntegration({
      id: discord.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ discord }) => {
    await deleteIntegration({
      source: "DISCORD",
      integration: discord,
    });
  },
});

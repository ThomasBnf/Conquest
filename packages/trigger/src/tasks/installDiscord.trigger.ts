import { createManyActivityTypes } from "@conquest/db/queries/activity-type/createManyActivityTypes";
import { createManyArchivedThreads } from "@conquest/db/queries/discord/createManyArchivedThreads";
import { createManyChannels } from "@conquest/db/queries/discord/createManyChannels";
import { createManyMembers } from "@conquest/db/queries/discord/createManyMembers";
import { createManyTags } from "@conquest/db/queries/discord/createManyTags";
import { createManyThreads } from "@conquest/db/queries/discord/createManyThreads";
import { listChannelMessages } from "@conquest/db/queries/discord/listChannelMessages";
import { deleteIntegration } from "@conquest/db/queries/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/queries/integrations/updateIntegration";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask, usage } from "@trigger.dev/sdk/v3";
import type { APIGuildCategoryChannel } from "discord-api-types/v10";
import { z } from "zod";
import { DISCORD_ACTIVITY_TYPES } from "../constants";
import { calculateMembersLevel } from "./calculateMembersLevel.trigger";
import { integrationSuccessEmail } from "./integrationSuccessEmail.trigger";

export const installDiscord = schemaTask({
  id: "install-discord",
  machine: "small-2x",
  schema: z.object({
    discord: DiscordIntegrationSchema,
    channels: z.array(z.custom<APIGuildCategoryChannel>()),
  }),

  run: async ({ discord, channels }) => {
    const { workspace_id, external_id } = discord;
    if (!external_id) return;

    console.log(channels);

    const createdChannels = await createManyChannels({ discord, channels });

    await createManyActivityTypes({
      activity_types: DISCORD_ACTIVITY_TYPES,
      workspace_id,
    });

    const tags = await createManyTags({ discord });

    await createManyMembers({ discord, tags });
    await createManyThreads({ discord });

    for (const channel of createdChannels ?? []) {
      console.log("channel", channel);

      await createManyArchivedThreads({ discord, channel });

      if (!channel.external_id) continue;

      await listChannelMessages({
        discord,
        channel,
        workspace_id,
      });
    }

    await calculateMembersLevel.trigger({ workspace_id });
    await integrationSuccessEmail.trigger({
      integration: discord,
      workspace_id,
    });
  },
  onSuccess: async ({ discord }) => {
    console.log(usage.getCurrent());

    await updateIntegration({
      id: discord.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ discord }) => {
    const { workspace_id } = discord;

    await deleteIntegration({
      source: "DISCORD",
      integration: discord,
    });

    await calculateMembersLevel.trigger({ workspace_id });
  },
});

import { listChannels } from "@conquest/clickhouse/channels/listChannels";
import { createManyArchivedThreads } from "@conquest/clickhouse/discord/createManyArchivedThreads";
import { createManyMembers } from "@conquest/clickhouse/discord/createManyMembers";
import { createManyTags } from "@conquest/clickhouse/discord/createManyTags";
import { createManyThreads } from "@conquest/clickhouse/discord/createManyThreads";
import { listChannelMessages } from "@conquest/clickhouse/discord/listChannelMessages";
import { deleteIntegration } from "@conquest/clickhouse/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/clickhouse/integrations/updateIntegration";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { getAllMembersMetrics } from "./getAllMembersMetrics";

export const installDiscord = schemaTask({
  id: "install-discord",
  machine: "small-2x",
  schema: z.object({
    discord: DiscordIntegrationSchema,
  }),

  run: async ({ discord }) => {
    const { workspace_id, external_id } = discord;

    if (!external_id) return;

    const channels = await listChannels({ workspace_id, source: "Discord" });
    const tags = await createManyTags({ discord });
    const members = await createManyMembers({ discord, tags });
    await createManyThreads({ discord });

    for (const channel of channels ?? []) {
      await createManyArchivedThreads({ discord, channel });

      if (!channel.external_id) continue;

      await listChannelMessages({
        discord,
        channel,
        workspace_id,
      });
    }

    await getAllMembersMetrics.trigger({ workspace_id });
    // await batchMergeMembers({ members });
    // await integrationSuccessEmail.trigger({
    //   integration: discord,
    //   workspace_id,
    // });
  },
  onSuccess: async ({ discord }) => {
    await updateIntegration({
      id: discord.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ discord }) => {
    await deleteIntegration({ integration: discord });
  },
});

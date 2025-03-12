import { listChannels } from "@conquest/clickhouse/channels/listChannels";
import { createManyArchivedThreads } from "@conquest/db/discord/createManyArchivedThreads";
import { createManyMembers } from "@conquest/db/discord/createManyMembers";
import { createManyTags } from "@conquest/db/discord/createManyTags";
import { createManyThreads } from "@conquest/db/discord/createManyThreads";
import { listChannelMessages } from "@conquest/db/discord/listChannelMessages";
import { deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { getAllMembersMetrics } from "./getAllMembersMetrics";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installDiscord = schemaTask({
  id: "install-discord",
  machine: "small-2x",
  schema: z.object({
    discord: DiscordIntegrationSchema,
  }),

  run: async ({ discord }) => {
    metadata.set("progress", 0);

    const { workspace_id, external_id } = discord;

    if (!external_id) return;

    const channels = await listChannels({ workspace_id, source: "Discord" });
    metadata.set("progress", 10);

    const tags = await createManyTags({ discord });
    metadata.set("progress", 15);
    await createManyMembers({ discord, tags });
    metadata.set("progress", 20);

    await createManyThreads({ discord });
    metadata.set("progress", 30);

    const channelProgressWeight = 45;
    const channelProgressIncrement =
      channelProgressWeight / (channels?.length ?? 1);

    for (const [index, channel] of (channels ?? []).entries()) {
      await createManyArchivedThreads({ discord, channel });

      if (!channel.external_id) continue;

      await listChannelMessages({
        discord,
        channel,
        workspace_id,
      });
      metadata.set("progress", 20 + (index + 1) * channelProgressIncrement);
    }

    await getAllMembersMetrics.trigger({ workspace_id });
    metadata.set("progress", 90);

    await integrationSuccessEmail.trigger({ integration: discord });
    metadata.set("progress", 100);
  },
  onSuccess: async ({ discord }) => {
    const { id, workspace_id } = discord;

    await updateIntegration({
      id,
      connected_at: new Date(),
      status: "CONNECTED",
      workspace_id,
    });
  },
  onFailure: async ({ discord }) => {
    await deleteIntegration({ integration: discord });
  },
});

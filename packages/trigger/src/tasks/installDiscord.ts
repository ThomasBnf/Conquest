import { listChannels } from "@conquest/clickhouse/channels/listChannels";
import { deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { logger, metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { createManyArchivedThreads } from "../discord/createManyArchivedThreads";
import { createManyMembers } from "../discord/createManyMembers";
import { createManyTags } from "../discord/createManyTags";
import { createManyThreads } from "../discord/createManyThreads";
import { listChannelMessages } from "../discord/listChannelMessages";
import { getAllMembersMetrics } from "./getAllMembersMetrics";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installDiscord = schemaTask({
  id: "install-discord",
  machine: "small-2x",
  schema: z.object({
    discord: DiscordIntegrationSchema,
  }),

  run: async ({ discord }) => {
    const { workspace_id } = discord;
    logger.info("discord", { discord });

    const channels = await listChannels({ workspace_id, source: "Discord" });
    logger.info("channels", { channels });
    metadata.set("progress", 10);

    const tags = await createManyTags({ discord });
    logger.info("tags", { tags });
    metadata.set("progress", 15);

    await createManyMembers({ discord, tags });
    metadata.set("progress", 20);

    await createManyThreads({ discord });
    metadata.set("progress", 30);

    const progressWeight = 45;
    const progressIncrement = progressWeight / (channels?.length ?? 1);

    for (const [index, channel] of (channels ?? []).entries()) {
      await createManyArchivedThreads({ discord, channel });

      if (!channel.external_id) continue;

      await listChannelMessages({
        discord,
        channel,
        workspace_id,
      });

      metadata.set("progress", 20 + (index + 1) * progressIncrement);
    }

    await getAllMembersMetrics.trigger(
      { workspace_id },
      { metadata: { workspace_id } },
    );
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

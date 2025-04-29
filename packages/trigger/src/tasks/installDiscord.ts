import { listChannels } from "@conquest/clickhouse/channels/listChannels";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { checkPermissions } from "../discord/checkPermissions";
import { createManyArchivedThreads } from "../discord/createManyArchivedThreads";
import { createManyMembers } from "../discord/createManyMembers";
import { createManyTags } from "../discord/createManyTags";
import { createManyThreads } from "../discord/createManyThreads";
import { listChannelMessages } from "../discord/listChannelMessages";
import { checkDuplicates } from "./checkDuplicates";
import { deleteIntegration } from "./deleteIntegration";
import { getAllMembersMetrics } from "./getAllMembersMetrics";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installDiscord = schemaTask({
  id: "install-discord",
  machine: "small-2x",
  schema: z.object({
    discord: DiscordIntegrationSchema,
  }),
  run: async ({ discord }) => {
    const { workspaceId } = discord;
    logger.info("discord", { discord });

    const channels = await listChannels({ workspaceId, source: "Discord" });
    logger.info("channels", { channels });

    const tags = await createManyTags({ discord });
    logger.info("tags", { tags });

    await createManyMembers({ discord, tags });
    await createManyThreads({ discord });

    for (const channel of channels) {
      logger.info(`CHANNEL - ${channel.name}`);

      await checkPermissions({ discord, channel });
      await createManyArchivedThreads({ discord, channel });

      if (!channel.externalId) continue;

      await listChannelMessages({
        channel,
        workspaceId,
      });
    }

    await getAllMembersMetrics.triggerAndWait({ workspaceId });
    await checkDuplicates.triggerAndWait({ workspaceId });
    await integrationSuccessEmail.trigger({ integration: discord });
  },
  onSuccess: async ({ discord }) => {
    const { id, workspaceId } = discord;

    await updateIntegration({
      id,
      connectedAt: new Date(),
      status: "CONNECTED",
      workspaceId,
    });
  },
  onFailure: async ({ discord }) => {
    await deleteIntegration.trigger({ integration: discord });
  },
});

import { listChannels } from "@conquest/db/queries/channel/listChannels";
import { createManyArchivedThreads } from "@conquest/db/queries/discord/createManyArchivedThreads";
import { createManyMembers } from "@conquest/db/queries/discord/createManyMembers";
import { createManyTags } from "@conquest/db/queries/discord/createManyTags";
import { createManyThreads } from "@conquest/db/queries/discord/createManyThreads";
import { listChannelMessages } from "@conquest/db/queries/discord/listChannelMessages";
import { deleteIntegration } from "@conquest/db/queries/integration/deleteIntegration";
import { updateIntegration } from "@conquest/db/queries/integration/updateIntegration";
import { listLevels } from "@conquest/db/queries/levels/listLevels";
import { batchMergeMembers } from "@conquest/db/queries/member/batchMergeMembers";
import { getMembersMetrics } from "@conquest/db/queries/member/getMembersMetrics";
import { DiscordIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installDiscord = schemaTask({
  id: "install-discord",
  machine: "small-2x",
  schema: z.object({
    discord: DiscordIntegrationSchema,
  }),

  run: async ({ discord }) => {
    const { workspace_id, external_id } = discord;
    if (!external_id) return;

    const channels = await listChannels({ workspace_id, source: "DISCORD" });

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

    await integrationSuccessEmail.trigger({
      integration: discord,
      workspace_id,
    });

    const levels = await listLevels({ workspace_id });
    await getMembersMetrics({ members, levels });
    await batchMergeMembers({ members });
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

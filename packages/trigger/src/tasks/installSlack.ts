import { listChannels } from "@conquest/clickhouse/channels/listChannels";
import { batchMergeMembers } from "@conquest/clickhouse/members/batchMergeMembers";
import { deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { createListMembers } from "../slack/createListMembers";
import { listMessages } from "../slack/listMessages";
import { getAllMembersMetrics } from "./getAllMembersMetrics";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installSlack = schemaTask({
  id: "install-slack",
  machine: "small-2x",
  schema: z.object({
    slack: SlackIntegrationSchema,
  }),
  run: async ({ slack }) => {
    metadata.set("progress", 0);

    const { workspace_id, details } = slack;
    const { access_token, access_token_iv } = details;

    if (!access_token) return;

    const token = await decrypt({
      access_token,
      iv: access_token_iv,
    });

    const web = new WebClient(token);
    metadata.set("progress", 10);

    const channels = await listChannels({ source: "Slack", workspace_id });
    const members = await createListMembers({ web, workspace_id });
    metadata.set("progress", 20);

    const channelProgressWeight = 60;
    const channelProgressIncrement = channelProgressWeight / channels.length;
    let currentProgress = 20;

    for (const channel of channels) {
      await web.conversations.join({ channel: channel.external_id ?? "" });
      await listMessages({ web, channel, workspace_id });

      currentProgress += channelProgressIncrement;
      metadata.set("progress", Math.round(currentProgress));
    }

    await batchMergeMembers({ members });
    metadata.set("progress", 90);

    await getAllMembersMetrics.trigger(
      { workspace_id },
      { metadata: { workspace_id } },
    );
    metadata.set("progress", 95);

    await integrationSuccessEmail.trigger({ integration: slack });
    metadata.set("progress", 100);
  },
  onSuccess: async ({ slack }) => {
    const { id, workspace_id } = slack;

    await updateIntegration({
      id,
      connected_at: new Date(),
      status: "CONNECTED",
      workspace_id,
    });
  },
  onFailure: async ({ slack }) => {
    await deleteIntegration({ integration: slack });
  },
});

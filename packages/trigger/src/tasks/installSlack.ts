import { listChannels } from "@conquest/clickhouse/channels/listChannels";
import { deleteIntegration } from "@conquest/clickhouse/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/clickhouse/integrations/updateIntegration";
import { createListMembers } from "@conquest/clickhouse/slack/createListMembers";
import { listMessages } from "@conquest/clickhouse/slack/listMessages";
import { decrypt } from "@conquest/clickhouse/utils/decrypt";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { getAllMembersMetrics } from "./getAllMembersMetrics";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installSlack = schemaTask({
  id: "install-slack",
  machine: "small-2x",
  schema: z.object({
    slack: SlackIntegrationSchema,
  }),
  run: async ({ slack }) => {
    const { workspace_id, details } = slack;
    const { access_token, access_token_iv } = details;

    if (!access_token) return;

    const token = await decrypt({
      access_token,
      iv: access_token_iv,
    });

    const web = new WebClient(token);

    const channels = await listChannels({ source: "Slack", workspace_id });
    const members = await createListMembers({ web, workspace_id });

    for (const channel of channels) {
      await web.conversations.join({ channel: channel.external_id ?? "" });
      await listMessages({ web, channel, workspace_id });
    }

    await getAllMembersMetrics.trigger({ workspace_id });
    // await batchMergeMembers({ members });
    await integrationSuccessEmail.trigger({ integration: slack, workspace_id });
  },
  onSuccess: async ({ slack }) => {
    await updateIntegration({
      id: slack.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ slack }) => {
    await deleteIntegration({ integration: slack });
  },
});

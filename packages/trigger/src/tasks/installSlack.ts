import { listChannels } from "@conquest/clickhouse/channels/listChannels";
import { deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { createListMembers } from "../slack/createListMembers";
import { listMessages } from "../slack/listMessages";
import { checkDuplicates } from "./checkDuplicates";
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
    await createListMembers({ web, workspace_id });

    for (const channel of channels) {
      await web.conversations.join({ channel: channel.external_id ?? "" });
      await listMessages({ web, channel, workspace_id });
    }

    await getAllMembersMetrics.triggerAndWait(
      { workspace_id },
      { metadata: { workspace_id } },
    );

    await checkDuplicates.triggerAndWait({ workspace_id });
    await integrationSuccessEmail.trigger({ integration: slack });
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

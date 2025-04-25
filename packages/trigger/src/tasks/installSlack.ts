import { listChannels } from "@conquest/clickhouse/channels/listChannels";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { createListMembers } from "../slack/createListMembers";
import { listMessages } from "../slack/listMessages";
import { checkDuplicates } from "./checkDuplicates";
import { deleteIntegration } from "./deleteIntegration";
import { getAllMembersMetrics } from "./getAllMembersMetrics";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installSlack = schemaTask({
  id: "install-slack",
  machine: "small-2x",
  schema: z.object({
    slack: SlackIntegrationSchema,
  }),
  run: async ({ slack }) => {
    const { workspaceId, details } = slack;
    const { accessToken, accessTokenIv } = details;

    if (!accessToken) return;

    const token = await decrypt({
      accessToken,
      iv: accessTokenIv,
    });

    const web = new WebClient(token);

    const channels = await listChannels({ source: "Slack", workspaceId });
    await createListMembers({ web, workspaceId });

    for (const channel of channels) {
      await web.conversations.join({ channel: channel.externalId ?? "" });
      await listMessages({ web, channel, workspaceId });
    }

    await getAllMembersMetrics.triggerAndWait({ workspaceId });
    await checkDuplicates.triggerAndWait({ workspaceId });
    await integrationSuccessEmail.trigger({ integration: slack });
  },
  onSuccess: async ({ slack }) => {
    const { id, workspaceId } = slack;

    await updateIntegration({
      id,
      connectedAt: new Date(),
      status: "CONNECTED",
      workspaceId,
    });
  },
  onFailure: async ({ slack }) => {
    await deleteIntegration.trigger({
      integration: slack,
      deleteIntegration: true,
    });
  },
});

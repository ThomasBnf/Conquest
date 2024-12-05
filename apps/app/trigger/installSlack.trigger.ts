import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { createListChannels } from "@/queries/slack/createListChannels";
import { createListMembers } from "@/queries/slack/createListMembers";
import { getMembersMetrics } from "@/queries/slack/getMembersMetrics";
import { listMessages } from "@/queries/slack/listMessages";
import { SlackIntegrationSchema } from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const installSlack = schemaTask({
  id: "install-slack",
  machine: {
    preset: "small-2x",
  },
  schema: z.object({
    integration: SlackIntegrationSchema,
    channels: z.array(z.string()),
  }),
  run: async ({ integration, channels }) => {
    const { workspace_id } = integration;
    const { token, slack_user_token } = integration.details;

    if (!token || !slack_user_token) return;

    const web = new WebClient(token);

    const createdChannels = await createListChannels({
      web,
      token,
      workspace_id,
      channels,
    });
    const members = await createListMembers({ web, workspace_id });

    for (const channel of createdChannels) {
      await listMessages({ web, channel, workspace_id });
    }

    await getMembersMetrics({ members, workspace_id });

    return members;
  },
  onSuccess: async (payload) => {
    const { external_id } = payload.integration;

    await updateIntegration({
      external_id,
      installed_at: new Date(),
      status: "INSTALLED",
    });
  },
});

import { updateIntegration } from "@/features/integrations/functions/updateIntegration";
import { createListChannels } from "@/features/slack/functions/createListChannels";
import { createListMembers } from "@/features/slack/functions/createListMembers";
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
  }),
  run: async ({ integration }) => {
    const { workspace_id } = integration;
    const { token, slack_user_token } = integration.details;

    if (!token || !slack_user_token) return;

    const web = new WebClient(token);

    await createListMembers({ web, workspace_id });
    await createListChannels({ web, token, workspace_id });
  },
  onSuccess: async (payload) => {
    const { external_id } = payload.integration;

    await updateIntegration({
      external_id,
      installed_at: new Date(),
      status: "CONNECTED",
    });
  },
});

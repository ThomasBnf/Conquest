import { updateIntegration } from "@/features/integrations/functions/updateIntegration";
import { createListChannels } from "@/features/slack/functions/createListChannels";
import { createListMembers } from "@/features/slack/functions/createListMembers";
import type { SlackIntegration } from "@conquest/zod/integration.schema";

import { WebClient } from "@slack/web-api";
import { task } from "@trigger.dev/sdk/v3";

export const installSlack = task({
  id: "install-slack",
  machine: {
    preset: "small-2x",
  },
  run: async (payload: { integration: SlackIntegration }) => {
    const { integration } = payload;
    const { workspace_id, external_id } = integration;
    const { token, slack_user_token } = integration.details;

    if (!token || !slack_user_token) return;

    const web = new WebClient(token);

    await createListMembers({ web, workspace_id });
    await createListChannels({ web, token, workspace_id });

    return await updateIntegration({
      external_id,
      installed_at: new Date(),
      status: "CONNECTED",
    });
  },
});

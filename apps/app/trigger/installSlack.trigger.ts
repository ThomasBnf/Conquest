import { updateIntegration } from "@/features/integrations/functions/updateIntegration";
import { createListChannels } from "@/features/slack/functions/createListChannels";
import { createListMembers } from "@/features/slack/functions/createListMembers";
import {
  type Integration,
  IntegrationSchema,
} from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";
import { task } from "@trigger.dev/sdk/v3";

export const installSlack = task({
  id: "install-slack",
  run: async (payload: { integration: Integration }) => {
    const parsedIntegration = IntegrationSchema.parse(payload.integration);

    console.log(parsedIntegration);

    const workspace_id = parsedIntegration.workspace_id;

    if (!parsedIntegration) return;

    const { token, slack_user_token, external_id } = parsedIntegration;

    if (!token || !slack_user_token) return;

    const web = new WebClient(token);

    await createListMembers({ web, workspace_id });
    await createListChannels({ web, token, workspace_id });

    await updateIntegration({
      external_id,
      installed_at: new Date(),
      status: "CONNECTED",
    });
  },
});

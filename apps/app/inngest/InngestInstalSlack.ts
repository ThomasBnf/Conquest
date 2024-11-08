import { updateIntegration } from "@/features/integrations/functions/updateIntegration";
import { createListChannels } from "@/features/slack/functions/createListChannels";
import { createListMembers } from "@/features/slack/functions/createListMembers";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";
import { inngest } from "./client";

export const InngestInstalSlack = inngest.createFunction(
  { id: "install-slack" },
  { event: "integrations/slack" },
  async ({ event, step }) => {
    const { integration } = event.data;

    const parsedIntegration = IntegrationSchema.parse(integration);
    const workspace_id = parsedIntegration.workspace_id;

    if (!integration) return;

    const { token, slack_user_token, external_id } =
      IntegrationSchema.parse(integration);

    if (!token || !slack_user_token) return;

    const web = new WebClient(token);

    await step.run("createListMembers", async () => {
      return await createListMembers({ web, workspace_id });
    });

    await step.run("createListChannels", async () => {
      return await createListChannels({ web, token, workspace_id });
    });

    await step.run("updateIntegration", async () => {
      return await updateIntegration({
        external_id,
        installed_at: new Date(),
        status: "CONNECTED",
      });
    });
  },
);

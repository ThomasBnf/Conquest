import { updateIntegration } from "@/features/integrations/functions/updateIntegration";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { inngest } from "../client";

export const InngestInstallSlack = inngest.createFunction(
  { id: "install-slack" },
  { event: "integrations/slack" },
  async ({ event, step }) => {
    const { integration } = event.data;
    const parsedIntegration = IntegrationSchema.parse(integration);
    const workspace_id = parsedIntegration.workspace_id;

    if (!integration) return;

    const { token, slack_user_token, external_id } = parsedIntegration;

    if (!token || !slack_user_token) return;

    await inngest.send({
      name: "slack/start-members-sync",
      data: { workspace_id, token },
    });

    await inngest.send({
      name: "slack/start-channels-sync",
      data: { workspace_id, token },
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

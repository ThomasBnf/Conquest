import { updateIntegration } from "@/features/integrations/functions/updateIntegration";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { inngest } from "../client";

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

    inngest.send({
      name: "slack/create-list-members",
      data: { workspace_id, token },
    });

    inngest.send({
      name: "slack/create-list-channels",
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

import { updateIntegration } from "@/features/integrations/functions/updateIntegration";
import { safeAction } from "@/lib/safeAction";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";
import { z } from "zod";
import { createListChannels } from "./createListChannels";
import { createListMembers } from "./createListMembers";

export const installSlack = safeAction
  .metadata({
    name: "installSlack",
  })
  .schema(
    z.object({
      integration: IntegrationSchema,
    }),
  )
  .action(async ({ parsedInput: { integration } }) => {
    const { workspace_id } = integration;

    const { token, slack_user_token, external_id } =
      IntegrationSchema.parse(integration);

    if (!token || !slack_user_token) return;

    const web = new WebClient(token);

    await createListMembers({ web, workspace_id });
    await createListChannels({ web, token, workspace_id });

    return await updateIntegration({
      external_id,
      installed_at: new Date(),
      status: "CONNECTED",
    });
  });

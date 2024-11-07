"use server";

import { updateIntegration } from "@/features/integrations/functions/updateIntegration";
import { createListChannels } from "@/features/slack/functions/createListChannels";
import { createListMembers } from "@/features/slack/functions/createListMembers";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";
import { authAction } from "lib/authAction";
import { revalidatePath } from "next/cache";

export const installSlack = authAction
  .metadata({
    name: "installSlack",
  })
  .action(async ({ ctx: { user } }) => {
    const slug = user.workspace.slug;
    const integration = user.workspace.integrations.find(
      (integration) => integration.source === "SLACK",
    );
    const workspace_id = user.workspace_id;

    if (!integration) return;

    const { token, slack_user_token, external_id } =
      IntegrationSchema.parse(integration);

    if (!token || !slack_user_token) return;

    const web = new WebClient(token);

    await createListMembers({ web, workspace_id });
    await createListChannels({ web, token });

    await updateIntegration({
      external_id,
      installed_at: new Date(),
      status: "CONNECTED",
    });

    return revalidatePath(`/${slug}`);
  });

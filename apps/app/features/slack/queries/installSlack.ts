"use server";

import { listChannels } from "@/features/channels/queries/listChannels";
import { updateIntegration } from "@/features/integrations/actions/updateIntegration";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";
import { authAction } from "lib/authAction";
import { revalidatePath } from "next/cache";
import { createUsers } from "./createUsers";

export const installSlack = authAction
  .metadata({
    name: "installSlack",
  })
  .action(async ({ ctx: { user } }) => {
    const slug = user.workspace.slug;
    const integration = user.workspace.integrations.find(
      (integration) => integration.source === "SLACK",
    );

    if (!integration) return;

    const { token, external_id } = IntegrationSchema.parse(integration);

    if (!token) return;

    const web = new WebClient(token);

    await createUsers({ web });
    await listChannels({ web, token });

    await updateIntegration({
      external_id,
      installed_at: new Date(),
      status: "CONNECTED",
    });

    return revalidatePath(`/${slug}`);
  });

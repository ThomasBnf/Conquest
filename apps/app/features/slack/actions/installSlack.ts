"use server";

import { listChannels } from "@/features/channels/queries/listChannels";
import { updateIntegrationAction } from "@/features/integrations/actions/updateIntegrationAction";
import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";
import { authAction } from "lib/authAction";
import { z } from "zod";
import { createUsers } from "../queries/createUsers";

export const installSlack = authAction
  .metadata({
    name: "installSlack",
  })
  .schema(
    z.object({
      integration: IntegrationSchema,
    }),
  )
  .action(async ({ ctx: { user }, parsedInput: { integration } }) => {
    const slack_token = user.workspace.integrations.find(
      (integration) => integration.source === "SLACK",
    )?.token;

    if (!slack_token) return;

    const web = new WebClient(slack_token);

    await createUsers({ web });
    await listChannels({ web, token: slack_token });
    updateIntegrationAction({
      id: integration.id,
      installed_at: new Date(),
      status: "SYNCING",
    });
  });

import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { createListChannels } from "@/queries/slack/createListChannels";
import { createListMembers } from "@/queries/slack/createListMembers";
import { getMembersMetrics } from "@/queries/slack/getMembersMetrics";
import { listMessages } from "@/queries/slack/listMessages";
import { SlackIntegrationSchema } from "@conquest/zod/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
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
    channels: z.array(z.string()),
  }),
  run: async ({ integration, channels }) => {
    const { workspace_id, details } = integration;
    const { token, slack_user_token } = details;

    if (!token || !slack_user_token) {
      return;
    }

    await updateIntegration({
      external_id: integration.external_id,
      installed_at: null,
      status: "SYNCING",
    });

    const web = new WebClient(token);
    let members: Member[] = [];

    const createdChannels = await createListChannels({
      web,
      token,
      workspace_id,
      channels,
    });

    if (integration.status !== "INSTALLED") {
      members = await createListMembers({ web, workspace_id });
    }

    for (const channel of createdChannels) {
      await listMessages({ web, channel, workspace_id });
    }

    if (members.length > 0) {
      await getMembersMetrics({ members });
    }

    return members;
  },
  onSuccess: async ({ integration: { external_id } }) => {
    await updateIntegration({
      external_id,
      installed_at: new Date(),
      status: "INSTALLED",
    });
  },
  onFailure: async ({ integration }) => {
    await deleteIntegration({
      source: "SLACK",
      integration,
    });
  },
});

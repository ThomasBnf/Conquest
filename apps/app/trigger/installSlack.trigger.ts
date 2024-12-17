import { SLACK_ACTIVITY_TYPES } from "@/constant";
import { prisma } from "@/lib/prisma";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { createListChannels } from "@/queries/slack/createListChannels";
import { createListMembers } from "@/queries/slack/createListMembers";
import { getMembersMetrics } from "@/queries/slack/getMembersMetrics";
import { listMessages } from "@/queries/slack/listMessages";
import { SlackIntegrationSchema } from "@conquest/zod/integration.schema";
import { WebClient } from "@slack/web-api";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const installSlack = schemaTask({
  id: "install-slack",
  machine: {
    preset: "small-2x",
  },
  schema: z.object({
    slack: SlackIntegrationSchema,
    channels: z.array(z.string()),
  }),
  retry: {
    maxAttempts: 0,
  },
  run: async ({ slack, channels }) => {
    const { workspace_id, details } = slack;
    const { token, slack_user_token } = details;

    if (!token || !slack_user_token) {
      return;
    }

    await updateIntegration({
      external_id: slack.external_id,
      installed_at: null,
      status: "SYNCING",
    });

    await prisma.activities_types.createMany({
      data: SLACK_ACTIVITY_TYPES.map((activity_type) => {
        const { name, source, key, weight, deletable } = activity_type;
        return {
          name,
          source,
          key,
          weight,
          deletable,
          workspace_id,
        };
      }),
    });

    const web = new WebClient(token);

    const createdChannels = await createListChannels({
      web,
      token,
      workspace_id,
      channels,
    });

    const members = await createListMembers({ web, workspace_id });

    for (const channel of createdChannels) {
      await listMessages({ web, channel, workspace_id });
    }

    for (const member of members) {
      await getMembersMetrics({ member });
    }

    return members;
  },
  onSuccess: async ({ slack: { external_id } }) => {
    await updateIntegration({
      external_id,
      installed_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ slack }) => {
    await deleteIntegration({
      source: "SLACK",
      integration: slack,
    });
  },
});

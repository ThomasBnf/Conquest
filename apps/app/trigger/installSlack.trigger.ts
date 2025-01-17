import { SLACK_ACTIVITY_TYPES } from "@/constant";
import { createManyActivityTypes } from "@/queries/activity-type/createManyActivityTypes";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { createListChannels } from "@/queries/slack/createListChannels";
import { createListMembers } from "@/queries/slack/createListMembers";
import { listMessages } from "@/queries/slack/listMessages";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { calculateMembersLevel } from "./calculateMembersLevel";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installSlack = schemaTask({
  id: "install-slack",
  schema: z.object({
    slack: SlackIntegrationSchema,
    channels: z.array(z.string()),
  }),
  run: async ({ slack, channels }) => {
    const { workspace_id, details } = slack;
    const { token, slack_user_token } = details;

    if (!token || !slack_user_token) return;

    await updateIntegration({
      id: slack.id,
      status: "SYNCING",
    });

    const web = new WebClient(token);

    const createdChannels = await createListChannels({
      web,
      token,
      workspace_id,
      channels,
    });

    await createManyActivityTypes({
      activity_types: SLACK_ACTIVITY_TYPES,
      workspace_id,
    });

    await createListMembers({ web, workspace_id });

    for (const channel of createdChannels) {
      await listMessages({ web, channel, workspace_id });
    }

    await calculateMembersLevel.trigger({ workspace_id });
  },
  onSuccess: async ({ slack }) => {
    const { workspace_id } = slack;

    await integrationSuccessEmail.trigger({
      integration: slack,
      workspace_id,
    });

    await updateIntegration({
      id: slack.id,
      connected_at: new Date(),
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

import { createManyActivityTypes } from "@conquest/db/queries/activity-type/createManyActivityTypes";
import { deleteIntegration } from "@conquest/db/queries/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/queries/integrations/updateIntegration";
import { batchMergeMembers } from "@conquest/db/queries/members/batchMergeMembers";
import { createListChannels } from "@conquest/db/queries/slack/createListChannels";
import { createListMembers } from "@conquest/db/queries/slack/createListMembers";
import { listMessages } from "@conquest/db/queries/slack/listMessages";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { schemaTask, usage } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { SLACK_ACTIVITY_TYPES } from "../constants";
import { calculateMembersLevel } from "./calculateMembersLevel.trigger";
import { integrationSuccessEmail } from "./integrationSuccessEmail.trigger";

export const installSlack = schemaTask({
  id: "install-slack",
  machine: "small-2x",
  schema: z.object({
    slack: SlackIntegrationSchema,
    channels: z.array(z.string()),
  }),
  run: async ({ slack, channels }) => {
    const { workspace_id, details } = slack;
    const { token, slack_user_token } = details;

    if (!token || !slack_user_token) return;

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

    const members = await createListMembers({ web, workspace_id });

    for (const channel of createdChannels) {
      await listMessages({ web, channel, workspace_id });
    }

    await calculateMembersLevel.trigger({ workspace_id });
    await batchMergeMembers({ members });
    await integrationSuccessEmail.trigger({ integration: slack, workspace_id });
  },
  onSuccess: async ({ slack }) => {
    console.log(usage.getCurrent());

    await updateIntegration({
      id: slack.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ slack }) => {
    const { workspace_id } = slack;

    await deleteIntegration({
      source: "SLACK",
      integration: slack,
    });

    await calculateMembersLevel.trigger({ workspace_id });
  },
});

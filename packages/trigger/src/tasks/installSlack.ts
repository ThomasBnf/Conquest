import { listChannels } from "@conquest/db/queries/channel/listChannels";
import { deleteIntegration } from "@conquest/db/queries/integration/deleteIntegration";
import { updateIntegration } from "@conquest/db/queries/integration/updateIntegration";
import { listLevels } from "@conquest/db/queries/levels/listLevels";
import { batchMergeMembers } from "@conquest/db/queries/member/batchMergeMembers";
import { getMembersMetrics } from "@conquest/db/queries/member/getMembersMetrics";
import { createListMembers } from "@conquest/db/queries/slack/createListMembers";
import { listMessages } from "@conquest/db/queries/slack/listMessages";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { WebClient } from "@slack/web-api";
import { schemaTask, usage } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installSlack = schemaTask({
  id: "install-slack",
  machine: "small-2x",
  schema: z.object({
    slack: SlackIntegrationSchema,
  }),
  run: async ({ slack }) => {
    const { workspace_id, details } = slack;
    const { token, slack_user_token } = details;

    if (!token || !slack_user_token) return;

    const web = new WebClient(token);

    const channels = await listChannels({ workspace_id, source: "SLACK" });
    const members = await createListMembers({ web, workspace_id });

    for (const channel of channels) {
      await web.conversations.join({ channel: channel.external_id ?? "" });
      await listMessages({ web, channel, workspace_id });
    }

    const levels = await listLevels({ workspace_id });
    await getMembersMetrics({ members, levels });
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
    await deleteIntegration({
      source: "SLACK",
      integration: slack,
    });
  },
});

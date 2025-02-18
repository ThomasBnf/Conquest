import { deleteIntegration } from "@conquest/db/queries/integration/deleteIntegration";
import { updateIntegration } from "@conquest/db/queries/integration/updateIntegration";
import { createManyEvents } from "@conquest/db/queries/livestorm/createManyEvents";
import { createWebhook } from "@conquest/db/queries/livestorm/createWebhook";
import { getRefreshToken } from "@conquest/db/queries/livestorm/getRefreshToken";
import { batchMergeMembers } from "@conquest/db/queries/member/batchMergeMembers";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installLivestorm = schemaTask({
  id: "install-livestorm",
  machine: "small-2x",
  schema: z.object({
    livestorm: LivestormIntegrationSchema,
  }),
  run: async ({ livestorm }) => {
    const { id, details, workspace_id } = livestorm;
    const { access_token, expires_in } = details;

    const isExpired = new Date(Date.now() + expires_in * 1000) < new Date();

    let accessToken = access_token;
    if (isExpired) accessToken = await getRefreshToken(livestorm);

    const webhookEvents = [
      "session.created",
      "session.ended",
      "people.registered",
    ];

    for (const event of webhookEvents) {
      await createWebhook({
        accessToken,
        event,
      });
    }

    await updateIntegration({
      id,
      details: {
        ...details,
        access_token: accessToken,
      },
    });

    const members = await createManyEvents({ livestorm });

    // await calculateMembersLevel.trigger({ workspace_id });
    await batchMergeMembers({ members });
    await integrationSuccessEmail.trigger({
      integration: livestorm,
      workspace_id,
    });
  },
  onSuccess: async ({ livestorm }) => {
    await updateIntegration({
      id: livestorm.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ livestorm }) => {
    const { workspace_id } = livestorm;

    await deleteIntegration({
      source: "LIVESTORM",
      integration: livestorm,
    });
  },
});

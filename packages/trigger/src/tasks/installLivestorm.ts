import { batchMergeMembers } from "@conquest/clickhouse/members/batchMergeMembers";
import { deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { createManyEvents } from "@conquest/db/livestorm/createManyEvents";
import { createWebhook } from "@conquest/db/livestorm/createWebhook";
import { getRefreshToken } from "@conquest/db/livestorm/getRefreshToken";
import { decrypt } from "@conquest/db/utils/decrypt";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { getAllMembersMetrics } from "./getAllMembersMetrics";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installLivestorm = schemaTask({
  id: "install-livestorm",
  machine: "small-2x",
  schema: z.object({
    livestorm: LivestormIntegrationSchema,
  }),
  run: async ({ livestorm }) => {
    const { details, workspace_id } = livestorm;
    const { access_token, access_token_iv, expires_in } = details;
    metadata.set("progress", 5);

    const isExpired = new Date(Date.now() + expires_in * 1000) < new Date();

    const decryptedAccessToken = await decrypt({
      access_token: access_token,
      iv: access_token_iv,
    });

    let accessToken = decryptedAccessToken;
    if (isExpired) accessToken = await getRefreshToken({ livestorm });

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
    metadata.set("progress", 10);

    const members = await createManyEvents({ livestorm });

    await batchMergeMembers({ members });
    metadata.set("progress", 90);

    await getAllMembersMetrics.trigger({ workspace_id });
    metadata.set("progress", 95);

    await integrationSuccessEmail.trigger({ integration: livestorm });
    metadata.set("progress", 100);
  },
  onSuccess: async ({ livestorm }) => {
    const { id, workspace_id } = livestorm;

    await updateIntegration({
      id,
      connected_at: new Date(),
      status: "CONNECTED",
      workspace_id,
    });
  },
  onFailure: async ({ livestorm }) => {
    await deleteIntegration({ integration: livestorm });
  },
});

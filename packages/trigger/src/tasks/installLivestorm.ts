import { deleteIntegration } from "./deleteIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { createManyEvents } from "../livestorm/createManyEvents";
import { createWebhook } from "../livestorm/createWebhook";
import { getRefreshToken } from "../livestorm/getRefreshToken";
import { checkDuplicates } from "./checkDuplicates";
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

    await createManyEvents({ livestorm });

    await getAllMembersMetrics.triggerAndWait(
      { workspace_id },
      { metadata: { workspace_id } },
    );

    await checkDuplicates.triggerAndWait({ workspace_id });
    await integrationSuccessEmail.trigger({ integration: livestorm });
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
    await deleteIntegration.trigger({ integration: livestorm });
  },
});

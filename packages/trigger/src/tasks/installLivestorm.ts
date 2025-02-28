import { deleteIntegration } from "@conquest/clickhouse/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/clickhouse/integrations/updateIntegration";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const installLivestorm = schemaTask({
  id: "install-livestorm",
  machine: "small-2x",
  schema: z.object({
    livestorm: LivestormIntegrationSchema,
  }),
  run: async ({ livestorm }) => {
    // const { details, workspace_id } = livestorm;
    // const { access_token, access_token_iv, expires_in, filter } = details;
    // const isExpired = new Date(Date.now() + expires_in * 1000) < new Date();
    // const decryptedAccessToken = await decrypt({
    //   access_token: access_token,
    //   iv: access_token_iv,
    // });
    // let accessToken = decryptedAccessToken;
    // if (isExpired) accessToken = await getRefreshToken(livestorm);
    // const webhookEvents = [
    //   "session.created",
    //   "session.ended",
    //   "people.registered",
    // ];
    // for (const event of webhookEvents) {
    //   await createWebhook({
    //     accessToken,
    //     event,
    //   });
    // }
    // const members = await createManyEvents({
    //   filter,
    //   access_token: accessToken,
    //   workspace_id,
    // });
    // await getAllMembersMetrics.trigger({ workspace_id });
    // await batchMergeMembers({ members });
    // await integrationSuccessEmail.trigger({
    //   integration: livestorm,
    //   workspace_id,
    // });
  },
  onSuccess: async ({ livestorm }) => {
    await updateIntegration({
      id: livestorm.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ livestorm }) => {
    await deleteIntegration({ integration: livestorm });
  },
});

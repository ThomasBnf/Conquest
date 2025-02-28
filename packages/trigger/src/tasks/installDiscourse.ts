import { deleteIntegration } from "@conquest/clickhouse/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/clickhouse/integrations/updateIntegration";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const installDiscourse = schemaTask({
  id: "install-discourse",
  machine: "small-2x",
  schema: z.object({
    discourse: DiscourseIntegrationSchema,
  }),
  run: async ({ discourse }) => {
    // const { workspace_id, details } = discourse;
    // const { community_url, community_url_iv, api_key, api_key_iv } = details;
    // const decryptedCommunityUrl = await decrypt({
    //   access_token: community_url,
    //   iv: community_url_iv,
    // });
    // const decryptedApiKey = await decrypt({
    //   access_token: api_key,
    //   iv: api_key_iv,
    // });
    // const client = discourseClient({
    //   community_url: decryptedCommunityUrl,
    //   api_key: decryptedApiKey,
    // });
    // const levels = await listLevels({ workspace_id });
    // const tags = await createManyTags({ client, workspace_id });
    // const members = await createManyMembers({
    //   discourse,
    //   client,
    //   tags,
    //   levels,
    // });
    // await batchMergeMembers({ members });
    // await integrationSuccessEmail.trigger({
    //   integration: discourse,
    //   workspace_id,
    // });
  },
  onSuccess: async ({ discourse }) => {
    await updateIntegration({
      id: discourse.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ discourse }) => {
    await deleteIntegration({ integration: discourse });
  },
});

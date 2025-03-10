import { batchMergeMembers } from "@conquest/clickhouse/members/batchMergeMembers";
import { discourseClient } from "@conquest/db/discourse";
import { createManyMembers } from "@conquest/db/discourse/createManyMembers";
import { createManyTags } from "@conquest/db/discourse/createManyTags";
import { deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installDiscourse = schemaTask({
  id: "install-discourse",
  machine: "small-2x",
  schema: z.object({
    discourse: DiscourseIntegrationSchema,
  }),
  run: async ({ discourse }) => {
    metadata.set("progress", 0);

    const { workspace_id, details } = discourse;
    const { community_url, community_url_iv, api_key, api_key_iv } = details;

    const decryptedCommunityUrl = await decrypt({
      access_token: community_url,
      iv: community_url_iv,
    });
    const decryptedApiKey = await decrypt({
      access_token: api_key,
      iv: api_key_iv,
    });

    const client = discourseClient({
      community_url: decryptedCommunityUrl,
      api_key: decryptedApiKey,
    });
    metadata.set("progress", 5);

    const tags = await createManyTags({ client, workspace_id });
    metadata.set("progress", 10);

    const members = await createManyMembers({
      discourse,
      client,
      tags,
    });
    metadata.set("progress", 90);

    await batchMergeMembers({ members });
    metadata.set("progress", 95);

    await integrationSuccessEmail.trigger({
      integration: discourse,
      workspace_id,
    });
    metadata.set("progress", 100);
  },
  onSuccess: async ({ discourse }) => {
    const { id, workspace_id } = discourse;

    await updateIntegration({
      id,
      connected_at: new Date(),
      status: "CONNECTED",
      workspace_id,
    });
  },
  onFailure: async ({ discourse }) => {
    await deleteIntegration({ integration: discourse });
  },
});

import { batchMergeMembers } from "@conquest/clickhouse/members/batchMergeMembers";
import { discourseClient } from "@conquest/db/discourse";
import { deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { createManyMembers } from "../discourse/createManyMembers";
import { createManyTags } from "../discourse/createManyTags";
import { getAllMembersMetrics } from "./getAllMembersMetrics";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installDiscourse = schemaTask({
  id: "install-discourse",
  machine: "small-2x",
  schema: z.object({
    discourse: DiscourseIntegrationSchema,
  }),
  run: async ({ discourse }) => {
    const { workspace_id, details } = discourse;
    const { community_url, api_key, api_key_iv } = details;

    const decryptedApiKey = await decrypt({
      access_token: api_key,
      iv: api_key_iv,
    });

    const client = discourseClient({
      community_url,
      api_key: decryptedApiKey,
    });

    const tags = await createManyTags({ client, workspace_id });

    const members = await createManyMembers({
      discourse,
      client,
      tags,
    });

    await batchMergeMembers({ members });

    await getAllMembersMetrics.triggerAndWait(
      { workspace_id },
      { metadata: { workspace_id } },
    );

    await integrationSuccessEmail.trigger({ integration: discourse });
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

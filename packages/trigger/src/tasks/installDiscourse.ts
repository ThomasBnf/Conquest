import { batchMergeMembers } from "@conquest/clickhouse/members/batchMergeMembers";
import { discourseClient } from "@conquest/db/discourse";
import { deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { decrypt } from "@conquest/db/utils/decrypt";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { metadata, schemaTask } from "@trigger.dev/sdk/v3";
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
    metadata.set("progress", 0);

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

    await getAllMembersMetrics.trigger(
      { workspace_id },
      { metadata: { workspace_id } },
    );
    metadata.set("progress", 95);

    await integrationSuccessEmail.trigger({ integration: discourse });
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

import { discourseClient } from "@conquest/db/discourse";
import { createManyMembers } from "@conquest/db/queries/discourse/createManyMembers";
import { createManyTags } from "@conquest/db/queries/discourse/createManyTags";
import { updateIntegration } from "@conquest/db/queries/integration/updateIntegration";
import { listLevels } from "@conquest/db/queries/levels/listLevels";
import { batchMergeMembers } from "@conquest/db/queries/member/batchMergeMembers";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installDiscourse = schemaTask({
  id: "install-discourse",
  machine: "small-2x",
  schema: z.object({
    discourse: DiscourseIntegrationSchema,
  }),
  run: async ({ discourse }) => {
    const { workspace_id, details } = discourse;
    const { community_url, api_key } = details;

    const client = discourseClient({ community_url, api_key });
    const levels = await listLevels({ workspace_id });

    const tags = await createManyTags({ client, workspace_id });
    const members = await createManyMembers({
      discourse,
      client,
      tags,
      levels,
    });

    await batchMergeMembers({ members });
    await integrationSuccessEmail.trigger({
      integration: discourse,
      workspace_id,
    });
  },
  onSuccess: async ({ discourse }) => {
    await updateIntegration({
      id: discourse.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  // onFailure: async ({ discourse }) => {
  //   await deleteIntegration({
  //     source: "DISCOURSE",
  //     integration: discourse,
  //   });
  // },
});

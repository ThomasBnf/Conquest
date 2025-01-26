import { DISCOURSE_ACTIVITY_TYPES } from "@/constant";
import { discourseClient } from "@/lib/discourse";
import { createManyActivityTypes } from "@/queries/activity-type/createManyActivityTypes";
import { createManyMembers } from "@/queries/discourse/createManyMembers";
import { createManyTags } from "@/queries/discourse/createManyTags";
import { listCategories } from "@/queries/discourse/list-categories";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { batchMergeMembers } from "@/queries/members/batchMergeMembers";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask, usage } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { integrationSuccessEmail } from "./integrationSuccessEmail.trigger";

export const installDiscourse = schemaTask({
  id: "install-discourse",
  machine: "small-2x",
  schema: z.object({
    discourse: DiscourseIntegrationSchema,
    community_url: z.string(),
    api_key: z.string(),
    user_fields: z
      .array(z.object({ id: z.string(), name: z.string() }))
      .optional(),
  }),
  run: async ({ discourse, community_url, api_key, user_fields }) => {
    const client = discourseClient({ community_url, api_key });
    const { workspace_id } = discourse;

    const discourseUpdated = DiscourseIntegrationSchema.parse(
      await updateIntegration({
        id: discourse.id,
        status: "SYNCING",
        details: {
          source: "DISCOURSE",
          community_url,
          api_key,
          user_fields,
        },
      }),
    );

    await listCategories({ client, workspace_id });

    await createManyActivityTypes({
      activity_types: DISCOURSE_ACTIVITY_TYPES,
      workspace_id,
    });

    const tags = await createManyTags({ client, workspace_id });

    const members = await createManyMembers({
      discourse: discourseUpdated,
      client,
      tags,
    });

    await batchMergeMembers({ members });

    integrationSuccessEmail.trigger({
      integration: discourseUpdated,
      workspace_id,
    });
  },
  onSuccess: async ({ discourse }) => {
    console.log(usage.getCurrent());

    await updateIntegration({
      id: discourse.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ discourse }) => {
    await deleteIntegration({
      source: "DISCOURSE",
      integration: discourse,
    });
  },
});

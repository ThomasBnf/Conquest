import { discourseClient } from "@conquest/db/discourse";
import { createManyActivityTypes } from "@conquest/db/queries/activity-type/createManyActivityTypes";
import { createManyMembers } from "@conquest/db/queries/discourse/createManyMembers";
import { createManyTags } from "@conquest/db/queries/discourse/createManyTags";
import { listCategories } from "@conquest/db/queries/discourse/list-categories";
import { deleteIntegration } from "@conquest/db/queries/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/queries/integrations/updateIntegration";
import { batchMergeMembers } from "@conquest/db/queries/members/batchMergeMembers";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask, usage } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { DISCOURSE_ACTIVITY_TYPES } from "../constants";
import { calculateMembersLevel } from "./calculateMembersLevel.trigger";
import { integrationSuccessEmail } from "./integrationSuccessEmail.trigger";

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

    await listCategories({ client, workspace_id });

    await createManyActivityTypes({
      activity_types: DISCOURSE_ACTIVITY_TYPES,
      workspace_id,
    });

    const tags = await createManyTags({ client, workspace_id });
    const members = await createManyMembers({ discourse, client, tags });

    await batchMergeMembers({ members });
    await integrationSuccessEmail.trigger({
      integration: discourse,
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
    const { workspace_id } = discourse;

    await deleteIntegration({
      source: "DISCOURSE",
      integration: discourse,
    });

    await calculateMembersLevel.trigger({ workspace_id });
  },
});

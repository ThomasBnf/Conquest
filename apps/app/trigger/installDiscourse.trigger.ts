import { DISCOURSE_ACTIVITY_TYPES } from "@/constant";
import { discourseClient } from "@/lib/discourse";
import { prisma } from "@/lib/prisma";
import { createManyActivityTypes } from "@/queries/activity-type/createManyActivityTypes";
import { createManyMembers } from "@/queries/discourse/createManyMembers";
import { createManyTags } from "@/queries/discourse/createManyTags";
import { listCategories } from "@/queries/discourse/list-categories";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const installDiscourse = schemaTask({
  id: "install-discourse",
  machine: {
    preset: "small-2x",
  },
  schema: z.object({
    discourse: DiscourseIntegrationSchema,
    community_url: z.string(),
    api_key: z.string(),
  }),
  retry: {
    maxAttempts: 1,
  },
  run: async ({ discourse, community_url, api_key }) => {
    const client = discourseClient({ community_url, api_key });
    const { workspace_id } = discourse;

    const discourseUpdated = DiscourseIntegrationSchema.parse(
      await prisma.integrations.update({
        where: {
          id: discourse.id,
        },
        data: {
          details: {
            source: "DISCOURSE",
            community_url,
            api_key,
            signature: "",
          },
          status: "SYNCING",
        },
      }),
    );

    const channels = await listCategories({
      client,
      workspace_id,
    });

    await createManyActivityTypes({
      activity_types: DISCOURSE_ACTIVITY_TYPES,
      channels,
      workspace_id,
    });

    const tags = await createManyTags({
      client,
      workspace_id,
    });

    await createManyMembers({
      discourse: discourseUpdated,
      client,
      tags,
    });
  },
  onSuccess: async ({ discourse }) => {
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

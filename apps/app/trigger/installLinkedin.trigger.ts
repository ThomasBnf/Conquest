import { LINKEDIN_ACTIVITY_TYPES } from "@/constant";
import { createManyActivityTypes } from "@/queries/activity-type/createManyActivityTypes";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { createManyComments } from "@/queries/linkedin/createManyComments";
import { createManyLikes } from "@/queries/linkedin/createManyLikes";
import { listComments } from "@/queries/linkedin/listComments";
import { listLikes } from "@/queries/linkedin/listLikes";
import { listPosts } from "@/queries/linkedin/listPosts";
import { LinkedInIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const installLinkedin = schemaTask({
  id: "install-linkedin",
  machine: {
    preset: "small-2x",
  },
  retry: {
    maxAttempts: 1,
  },
  schema: z.object({
    linkedin: LinkedInIntegrationSchema,
    organization_id: z.string(),
    organization_name: z.string(),
  }),
  run: async ({ linkedin, organization_id, organization_name }) => {
    const { workspace_id } = LinkedInIntegrationSchema.parse(linkedin);

    const integration = await updateIntegration({
      id: linkedin.id,
      details: {
        ...linkedin.details,
        organization_id,
        organization_name,
      },
      status: "SYNCING",
    });

    const parsedLinkedin = LinkedInIntegrationSchema.parse(integration);

    await createManyActivityTypes({
      activity_types: LINKEDIN_ACTIVITY_TYPES,
      workspace_id,
    });

    const posts = await listPosts({ linkedin });

    for (const post of posts) {
      const comments = await listComments({
        linkedin: parsedLinkedin,
        post_id: post.id,
      });
      await createManyComments({ linkedin: parsedLinkedin, comments });

      const likes = await listLikes({
        linkedin: parsedLinkedin,
        post_id: post.id,
      });
      await createManyLikes({ linkedin: parsedLinkedin, likes });
    }
  },
  onSuccess: async ({ linkedin }) => {
    await updateIntegration({
      id: linkedin.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ linkedin }) => {
    await deleteIntegration({
      source: "LINKEDIN",
      integration: linkedin,
    });
  },
});

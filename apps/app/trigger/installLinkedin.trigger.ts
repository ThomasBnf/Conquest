import { LINKEDIN_ACTIVITY_TYPES } from "@/constant";
import { createManyActivityTypes } from "@/queries/activity-type/createManyActivityTypes";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { createManyComments } from "@/queries/linkedin/createManyComments";
import { listComments } from "@/queries/linkedin/listComments";
import { listPosts } from "@/queries/linkedin/listPosts";
import { webhookSubscription } from "@/queries/linkedin/webhookSubscription";
import { batchMergeMembers } from "@/queries/members/batchMergeMembers";
import { createPost } from "@/queries/posts/createPost";
import { LinkedInIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import { schemaTask, usage } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { calculateMembersLevel } from "./calculateMembersLevel.trigger";
import { integrationSuccessEmail } from "./integrationSuccessEmail.trigger";

export const installLinkedin = schemaTask({
  id: "install-linkedin",
  schema: z.object({
    linkedin: LinkedInIntegrationSchema,
    user_id: z.string(),
    organization_id: z.string(),
    organization_name: z.string(),
  }),
  run: async ({ linkedin, user_id, organization_id, organization_name }) => {
    const { workspace_id } = LinkedInIntegrationSchema.parse(linkedin);

    const createdMembers: MemberWithCompany[] = [];

    const integration = await updateIntegration({
      id: linkedin.id,
      external_id: organization_id,
      details: {
        ...linkedin.details,
        name: organization_name,
        user_id,
      },
      status: "SYNCING",
    });

    const parsedLinkedin = LinkedInIntegrationSchema.parse(integration);

    await createManyActivityTypes({
      activity_types: LINKEDIN_ACTIVITY_TYPES,
      workspace_id,
    });

    const posts = await listPosts({ linkedin: parsedLinkedin });

    for (const post of posts) {
      const createdPost = await createPost({
        external_id: post.id,
        content: post.commentary,
        author_id: post.author,
        workspace_id,
        created_at: post.createdAt,
      });

      const comments = await listComments({
        linkedin: parsedLinkedin,
        post_id: post.id,
      });

      const members = await createManyComments({
        linkedin: parsedLinkedin,
        post: createdPost,
        comments,
      });

      createdMembers.push(...members);
    }

    await webhookSubscription({ linkedin: parsedLinkedin });
    await calculateMembersLevel.trigger({ workspace_id });
    await batchMergeMembers({ members: createdMembers });

    integrationSuccessEmail.trigger({
      integration: parsedLinkedin,
      workspace_id,
    });
  },
  onSuccess: async ({ linkedin }) => {
    console.log(usage.getCurrent());

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

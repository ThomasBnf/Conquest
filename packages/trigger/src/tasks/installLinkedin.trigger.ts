import { createManyActivityTypes } from "@conquest/db/queries/activity-type/createManyActivityTypes";
import { deleteIntegration } from "@conquest/db/queries/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/queries/integrations/updateIntegration";
import { createManyComments } from "@conquest/db/queries/linkedin/createManyComments";
import { listComments } from "@conquest/db/queries/linkedin/listComments";
import { listPosts } from "@conquest/db/queries/linkedin/listPosts";
import { webhookSubscription } from "@conquest/db/queries/linkedin/webhookSubscription";
import { batchMergeMembers } from "@conquest/db/queries/members/batchMergeMembers";
import { createPost } from "@conquest/db/queries/posts/createPost";
import { LinkedInIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import { schemaTask, usage } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { LINKEDIN_ACTIVITY_TYPES } from "../constants";
import { calculateMembersLevel } from "./calculateMembersLevel.trigger";
import { integrationSuccessEmail } from "./integrationSuccessEmail.trigger";

export const installLinkedin = schemaTask({
  id: "install-linkedin",
  machine: "small-2x",
  schema: z.object({
    linkedin: LinkedInIntegrationSchema,
  }),
  run: async ({ linkedin }) => {
    const { workspace_id } = LinkedInIntegrationSchema.parse(linkedin);

    const createdMembers: MemberWithCompany[] = [];

    await createManyActivityTypes({
      activity_types: LINKEDIN_ACTIVITY_TYPES,
      workspace_id,
    });

    const posts = await listPosts({ linkedin });

    for (const post of posts) {
      const createdPost = await createPost({
        external_id: post.id,
        content: post.commentary,
        author_id: post.author,
        workspace_id,
        created_at: post.createdAt,
      });

      const comments = await listComments({ linkedin, post_id: post.id });
      const members = await createManyComments({
        linkedin,
        post: createdPost,
        comments,
      });

      createdMembers.push(...members);
    }

    await webhookSubscription({ linkedin });
    await calculateMembersLevel.trigger({ workspace_id });
    await batchMergeMembers({ members: createdMembers });
    await integrationSuccessEmail.trigger({
      integration: linkedin,
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
    const { workspace_id } = linkedin;

    await deleteIntegration({
      source: "LINKEDIN",
      integration: linkedin,
    });

    await calculateMembersLevel.trigger({ workspace_id });
  },
});

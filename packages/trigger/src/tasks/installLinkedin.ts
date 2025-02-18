import { deleteIntegration } from "@conquest/db/queries/integration/deleteIntegration";
import { updateIntegration } from "@conquest/db/queries/integration/updateIntegration";
import { createManyComments } from "@conquest/db/queries/linkedin/createManyComments";
import { listComments } from "@conquest/db/queries/linkedin/listComments";
import { listPosts } from "@conquest/db/queries/linkedin/listPosts";
import { webhookSubscription } from "@conquest/db/queries/linkedin/webhookSubscription";
import { batchMergeMembers } from "@conquest/db/queries/member/batchMergeMembers";
import { createPost } from "@conquest/db/queries/post/createPost";
import { LinkedInIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { schemaTask, usage } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installLinkedin = schemaTask({
  id: "install-linkedin",
  machine: "small-2x",
  schema: z.object({
    linkedin: LinkedInIntegrationSchema,
  }),
  run: async ({ linkedin }) => {
    const { workspace_id } = LinkedInIntegrationSchema.parse(linkedin);

    const createdMembers: Member[] = [];

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
  },
});

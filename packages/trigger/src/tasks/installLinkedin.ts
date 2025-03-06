import { deleteIntegration } from "@conquest/db/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const installLinkedin = schemaTask({
  id: "install-linkedin",
  machine: "small-2x",
  schema: z.object({
    integration: IntegrationSchema,
  }),
  run: async ({ integration }) => {
    // const { workspace_id } = LinkedInIntegrationSchema.parse(linkedin);
    // const createdMembers: Member[] = [];
    // const posts = await listPosts({ linkedin });
    // for (const post of posts) {
    //   const createdPost = await createPost({
    //     external_id: post.id,
    //     content: post.commentary,
    //     author_id: post.author,
    //     workspace_id,
    //     created_at: post.createdAt,
    //   });
    //   const comments = await listComments({ linkedin, post_id: post.id });
    //   const members = await createManyComments({
    //     linkedin,
    //     post: createdPost,
    //     comments,
    //   });
    //   createdMembers.push(...members);
    // }
    // await getAllMembersMetrics.trigger({ workspace_id });
    // await batchMergeMembers({ members: createdMembers });
    // await integrationSuccessEmail.trigger({
    //   integration: linkedin,
    //   workspace_id,
    // });
  },
  onSuccess: async ({ integration }) => {
    const { id, workspace_id } = integration;

    await updateIntegration({
      id,
      connected_at: new Date(),
      status: "CONNECTED",
      workspace_id,
    });
  },
  onFailure: async ({ integration }) => {
    await deleteIntegration({ integration });
  },
});

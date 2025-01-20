import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { webhookSubscription } from "@/queries/linkedin/webhookSubscription";
import { LinkedInIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const installLinkedin = schemaTask({
  id: "install-linkedin",
  schema: z.object({
    linkedin: LinkedInIntegrationSchema,
    organization_id: z.string(),
    organization_name: z.string(),
  }),
  run: async ({ linkedin, organization_id, organization_name }) => {
    const { workspace_id } = LinkedInIntegrationSchema.parse(linkedin);

    const integration = await updateIntegration({
      id: linkedin.id,
      external_id: organization_id,
      details: {
        ...linkedin.details,
        name: organization_name,
      },
      status: "SYNCING",
    });

    const parsedLinkedin = LinkedInIntegrationSchema.parse(integration);

    // await createManyActivityTypes({
    //   activity_types: LINKEDIN_ACTIVITY_TYPES,
    //   workspace_id,
    // });

    // const posts = await listPosts({ linkedin: parsedLinkedin });

    // for (const post of posts) {
    //   const createdPost = await createPost({
    //     external_id: post.id,
    //     content: post.commentary,
    //     author_id: post.author,
    //     workspace_id,
    //     created_at: post.createdAt,
    //   });

    //   const comments = await listComments({
    //     linkedin: parsedLinkedin,
    //     post_id: post.id,
    //   });

    //   await createManyComments({
    //     linkedin: parsedLinkedin,
    //     post: createdPost,
    //     comments,
    //   });

    //   const likes = await listLikes({
    //     linkedin: parsedLinkedin,
    //     post_id: post.id,
    //   });

    //   await createManyLikes({
    //     linkedin: parsedLinkedin,
    //     post: createdPost,
    //     likes,
    //   });
    // }

    const result = await webhookSubscription({ linkedin: parsedLinkedin });
    console.log(result);
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

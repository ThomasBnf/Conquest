import { createListCategories } from "@/features/discourse/functions/createListCategories";
import { DiscourseIntegrationSchema } from "@conquest/zod/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const installDiscourse = schemaTask({
  id: "install-discourse",
  machine: {
    preset: "small-2x",
  },
  schema: z.object({
    integration: DiscourseIntegrationSchema,
  }),
  run: async ({ integration }) => {
    const {
      details: { api_key, community_url },
      workspace_id,
    } = integration;

    if (!api_key) return;

    // await createListTags({ api_key, community_url, workspace_id });
    // await createListMembers({ api_key, community_url, workspace_id });
    await createListCategories({ api_key, community_url, workspace_id });
  },
  onSuccess: async (payload) => {
    const { external_id } = payload.integration;

    // await updateIntegration({
    //   integration:{}
    //   external_id,
    //   installed_at: new Date(),
    //   status: "CONNECTED",
    //   post: 1,
    //   reply: 1,
    //   reaction: 1,
    //   invitation: 1,
    // });
  },
});

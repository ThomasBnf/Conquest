import { createListMembers } from "@/features/discourse/functions/createListMembers";
import { createListTags } from "@/features/discourse/functions/createListTags";
import { updateIntegration } from "@/features/integrations/functions/updateIntegration";
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

    await createListTags({ api_key, community_url, workspace_id });
    await createListMembers({ api_key, community_url, workspace_id });
    // await createListCategories({ token, workspace_id });
  },
  onSuccess: async (payload) => {
    const { external_id } = payload.integration;

    await updateIntegration({
      external_id,
      installed_at: new Date(),
      status: "CONNECTED",
    });
  },
});

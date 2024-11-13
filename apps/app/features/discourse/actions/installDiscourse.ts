"use server";

import { DiscourseIntegrationSchema } from "@conquest/zod/integration.schema";
import { authAction } from "lib/authAction";
import { revalidatePath } from "next/cache";
import { createListTags } from "../functions/createListTags";

export const installDiscourse = authAction
  .metadata({
    name: "installDiscourse",
  })
  .action(async ({ ctx: { user } }) => {
    const slug = user.workspace.slug;
    const integration = DiscourseIntegrationSchema.parse(
      user.workspace.integrations.find(
        (integration) => integration.details.source === "DISCOURSE",
      ),
    );
    const workspace_id = user.workspace_id;

    if (!integration) return;

    const {
      details: { api_key },
    } = integration;

    if (!api_key) return;

    await createListTags({ api_key, workspace_id });
    // await createListMembers({ token, workspace_id });
    // await createListCategories({ token, workspace_id });

    return revalidatePath(`/${slug}`);
  });

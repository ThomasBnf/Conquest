"use server";

import { IntegrationSchema } from "@conquest/zod/integration.schema";
import { authAction } from "lib/authAction";
import { revalidatePath } from "next/cache";
import { createListTags } from "../functions/createListTags";

export const installDiscourse = authAction
  .metadata({
    name: "installDiscourse",
  })
  .action(async ({ ctx: { user } }) => {
    const slug = user.workspace.slug;
    const integration = user.workspace.integrations.find(
      (integration) => integration.source === "DISCOURSE",
    );
    const workspace_id = user.workspace_id;

    if (!integration) return;

    const { token } = IntegrationSchema.parse(integration);

    if (!token) return;

    await createListTags({ token, workspace_id });
    // await createListMembers({ token, workspace_id });
    // await createListCategories({ token, workspace_id });

    return revalidatePath(`/${slug}`);
  });

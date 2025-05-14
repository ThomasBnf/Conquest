import { discourseClient } from "@conquest/db/discourse";
import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { prisma } from "@conquest/db/prisma";
import { decrypt } from "@conquest/db/utils/decrypt";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { createManyMembers } from "../discourse/createManyMembers";
import { createManyTags } from "../discourse/createManyTags";
import { checkDuplicates } from "./checkDuplicates";
import { getAllMembersMetrics } from "./getAllMembersMetrics";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installDiscourse = schemaTask({
  id: "install-discourse",
  machine: "small-2x",
  schema: z.object({
    discourse: DiscourseIntegrationSchema,
  }),
  run: async ({ discourse }) => {
    const { workspaceId, details } = discourse;
    const { communityUrl, apiKey, apiKeyIv } = details;

    const decryptedApiKey = await decrypt({
      accessToken: apiKey,
      iv: apiKeyIv,
    });

    const client = discourseClient({
      communityUrl,
      apiKey: decryptedApiKey,
    });

    const tags = await createManyTags({ client, workspaceId });

    await createManyMembers({
      discourse,
      client,
      tags,
    });

    await getAllMembersMetrics.triggerAndWait({ workspaceId });
    await checkDuplicates.triggerAndWait({ workspaceId });
    await integrationSuccessEmail.trigger({ integration: discourse });
  },
  onSuccess: async ({ discourse }) => {
    const { id, workspaceId } = discourse;

    await updateIntegration({
      id,
      connectedAt: new Date(),
      status: "CONNECTED",
      workspaceId,
    });
  },
  onFailure: async ({ discourse }) => {
    await prisma.integration.update({
      where: { id: discourse.id },
      data: { status: "FAILED" },
    });
  },
});

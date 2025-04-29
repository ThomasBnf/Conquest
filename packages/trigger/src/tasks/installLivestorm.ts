import { updateIntegration } from "@conquest/db/integrations/updateIntegration";
import { prisma } from "@conquest/db/prisma";
import { decrypt } from "@conquest/db/utils/decrypt";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { createManyEvents } from "../livestorm/createManyEvents";
import { createWebhook } from "../livestorm/createWebhook";
import { getRefreshToken } from "../livestorm/getRefreshToken";
import { checkDuplicates } from "./checkDuplicates";
import { deleteIntegration } from "./deleteIntegration";
import { getAllMembersMetrics } from "./getAllMembersMetrics";
import { integrationSuccessEmail } from "./integrationSuccessEmail";

export const installLivestorm = schemaTask({
  id: "install-livestorm",
  machine: "small-2x",
  schema: z.object({
    livestorm: LivestormIntegrationSchema,
  }),
  run: async ({ livestorm }) => {
    const { details, workspaceId } = livestorm;
    const { accessToken, accessTokenIv, expiresIn } = details;

    const isExpired = new Date(Date.now() + expiresIn * 1000) < new Date();

    const decryptedAccessToken = await decrypt({
      accessToken,
      iv: accessTokenIv,
    });

    let currentAccessToken = decryptedAccessToken;
    if (isExpired) currentAccessToken = await getRefreshToken({ livestorm });

    const webhookEvents = [
      "session.created",
      "session.ended",
      "people.registered",
    ];

    for (const event of webhookEvents) {
      await createWebhook({
        accessToken: currentAccessToken,
        event,
      });
    }

    await createManyEvents({ livestorm });

    await getAllMembersMetrics.triggerAndWait({ workspaceId });
    await checkDuplicates.triggerAndWait({ workspaceId });
    await integrationSuccessEmail.trigger({ integration: livestorm });
  },
  onSuccess: async ({ livestorm }) => {
    const { id, workspaceId } = livestorm;

    await updateIntegration({
      id,
      connectedAt: new Date(),
      status: "CONNECTED",
      workspaceId,
    });
  },
  onFailure: async ({ livestorm }) => {
    await prisma.integration.delete({ where: { id: livestorm.id } });
    await deleteIntegration.trigger({ integration: livestorm });
  },
});

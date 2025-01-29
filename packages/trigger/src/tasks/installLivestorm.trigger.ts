import { createManyActivityTypes } from "@conquest/db/queries/activity-type/createManyActivityTypes";
import { deleteIntegration } from "@conquest/db/queries/integrations/deleteIntegration";
import { updateIntegration } from "@conquest/db/queries/integrations/updateIntegration";
import { createManyEvents } from "@conquest/db/queries/livestorm/createManyEvents";
import { createWebhook } from "@conquest/db/queries/livestorm/createWebhook";
import { getRefreshToken } from "@conquest/db/queries/livestorm/getRefreshToken";
import { batchMergeMembers } from "@conquest/db/queries/members/batchMergeMembers";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask, usage } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { LIVESTORM_ACTIVITY_TYPES } from "../constants";
import { calculateMembersLevel } from "./calculateMembersLevel.trigger";
import { integrationSuccessEmail } from "./integrationSuccessEmail.trigger";

export const installLivestorm = schemaTask({
  id: "install-livestorm",
  machine: "small-2x",
  schema: z.object({
    livestorm: LivestormIntegrationSchema,
  }),
  run: async ({ livestorm }) => {
    const { id, details, workspace_id } = livestorm;
    const { access_token, expires_in } = details;

    const isExpired = new Date(Date.now() + expires_in * 1000) < new Date();

    let accessToken = access_token;
    if (isExpired) accessToken = await getRefreshToken(livestorm);

    const webhookEvents = [
      "session.created",
      "session.ended",
      "people.registered",
    ];

    for (const event of webhookEvents) {
      await createWebhook({
        accessToken,
        event,
      });
    }

    await updateIntegration({
      id,
      details: {
        ...details,
        access_token: accessToken,
      },
    });

    await createManyActivityTypes({
      activity_types: LIVESTORM_ACTIVITY_TYPES,
      workspace_id,
    });

    const members = await createManyEvents({ livestorm });

    await calculateMembersLevel.trigger({ workspace_id });
    await batchMergeMembers({ members });
    await integrationSuccessEmail.trigger({
      integration: livestorm,
      workspace_id,
    });
  },
  onSuccess: async ({ livestorm }) => {
    console.log(usage.getCurrent());

    await updateIntegration({
      id: livestorm.id,
      connected_at: new Date(),
      status: "CONNECTED",
    });
  },
  onFailure: async ({ livestorm }) => {
    const { workspace_id } = livestorm;

    await deleteIntegration({
      source: "LIVESTORM",
      integration: livestorm,
    });

    await calculateMembersLevel.trigger({ workspace_id });
  },
});

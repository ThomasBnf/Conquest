import { LIVESTORM_ACTIVITY_TYPES } from "@/constant";
import { createManyActivityTypes } from "@/queries/activity-type/createManyActivityTypes";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { updateIntegration } from "@/queries/integrations/updateIntegration";
import { createManyEvents } from "@/queries/livestorm/createManyEvents";
import { createWebhook } from "@/queries/livestorm/createWebhook";
import { getRefreshToken } from "@/queries/livestorm/getRefreshToken";
import { batchMergeMembers } from "@/queries/members/batchMergeMembers";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask, usage } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { calculateMembersLevel } from "./calculateMembersLevel.trigger";
import { integrationSuccessEmail } from "./integrationSuccessEmail.trigger";

export const installLivestorm = schemaTask({
  id: "install-livestorm",
  schema: z.object({
    livestorm: LivestormIntegrationSchema,
    organization_id: z.string(),
    organization_name: z.string(),
    filter: z.string().optional(),
  }),
  run: async ({ livestorm, organization_id, organization_name, filter }) => {
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
      external_id: organization_id,
      details: {
        ...details,
        name: organization_name,
        access_token: accessToken,
        filter,
      },
      status: "SYNCING",
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
    await deleteIntegration({
      source: "LIVESTORM",
      integration: livestorm,
    });
  },
});

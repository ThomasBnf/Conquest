import { updateActivityType as _updateActivityType } from "@conquest/clickhouse/activity-types/updateActivityType";
import { getAllMembersMetrics } from "@conquest/trigger/tasks/getAllMembersMetrics";
import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateActivityType = protectedProcedure
  .input(
    z.object({
      activityType: ActivityTypeSchema,
      isIntegrationPage: z.boolean(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { activityType, isIntegrationPage } = input;

    await _updateActivityType(activityType);

    if (!isIntegrationPage) {
      await getAllMembersMetrics.trigger(
        { workspaceId },
        { metadata: { workspaceId } },
      );
    }
  });

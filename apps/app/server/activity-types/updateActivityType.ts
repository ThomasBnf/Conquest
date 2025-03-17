import { updateActivityType as _updateActivityType } from "@conquest/clickhouse/activity-types/updateActivityType";
import { getAllMembersMetrics } from "@conquest/trigger/tasks/getAllMembersMetrics";
import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { protectedProcedure } from "../trpc";

export const updateActivityType = protectedProcedure
  .input(ActivityTypeSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;

    await _updateActivityType(input);

    await getAllMembersMetrics.trigger(
      { workspace_id },
      { metadata: { workspace_id } },
    );
  });

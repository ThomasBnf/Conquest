import { FormActivityTypeSchema } from "@/features/activities-types/schema/form.schema";
import { updateActivityType as _updateActivityType } from "@conquest/clickhouse/activity-types/updateActivityType";
import { getAllMembersMetrics } from "@conquest/trigger/tasks/getAllMembersMetrics";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateActivityType = protectedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
      data: FormActivityTypeSchema,
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id, data } = input;

    await _updateActivityType({ id, data });

    await getAllMembersMetrics.trigger(
      { workspace_id },
      { metadata: { workspace_id } },
    );
  });

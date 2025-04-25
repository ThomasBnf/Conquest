import { FormActivityTypeSchema } from "@/features/activities-types/schema/form.schema";
import { createActivityType as _createActivityType } from "@conquest/clickhouse/activity-types/createActivityType";
import { protectedProcedure } from "../trpc";

export const createActivityType = protectedProcedure
  .input(FormActivityTypeSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { source, key, conditions } = input;

    return await _createActivityType({
      ...input,
      key: `${source.toLowerCase()}:${key}`,
      conditions: { rules: conditions.rules },
      workspaceId,
    });
  });

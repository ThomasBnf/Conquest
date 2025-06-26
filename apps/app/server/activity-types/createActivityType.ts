import { FormActivityTypeSchema } from "@/features/activities-types/schema/form.schema";
import { createActivityType as _createActivityType } from "@conquest/db/activity-type/createActivityType";
import { protectedProcedure } from "../trpc";

export const createActivityType = protectedProcedure
  .input(FormActivityTypeSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { key, name, source, conditions, points } = input;

    return await _createActivityType({
      key: `${source.toLowerCase()}:${key}`,
      name,
      source,
      points,
      conditions,
      workspaceId,
    });
  });

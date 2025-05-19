import { FormCreateSchema } from "@/features/activities/schemas/form.schema";
import { createActivity as _createActivity } from "@conquest/clickhouse/activity/createActivity";
import { protectedProcedure } from "../trpc";

export const createActivity = protectedProcedure
  .input(FormCreateSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;

    return await _createActivity({
      ...input,
      workspaceId,
    });
  });

import { FormActivityTypeSchema } from "@/features/activities-types/schema/form.schema";
import { prisma } from "@conquest/db/prisma";
import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { protectedProcedure } from "../trpc";

export const createActivityType = protectedProcedure
  .input(FormActivityTypeSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;

    const createdActivityType = await prisma.activity_type.create({
      data: {
        ...input,
        key: `${input.source.toLowerCase()}:${input.key}`,
        workspace_id,
      },
    });

    return ActivityTypeSchema.parse(createdActivityType);
  });

import { FormActivityTypeSchema } from "@/features/activities-types/schema/form.schema";
import { prisma } from "@conquest/db/prisma";
import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateActivityType = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
      data: FormActivityTypeSchema,
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id, data } = input;

    const createdActivityType = await prisma.activity_type.update({
      where: {
        id,
        workspace_id,
      },
      data,
    });

    return ActivityTypeSchema.parse(createdActivityType);
  });

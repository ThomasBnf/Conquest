import { FormCreateSchema } from "@/features/activities/schemas/form.schema";
import { prisma } from "@conquest/db/prisma";
import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";
import { protectedProcedure } from "../trpc";

export const createActivity = protectedProcedure
  .input(FormCreateSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { activity_type_key, message, member_id } = input;

    const activityType = await prisma.activity_type.findFirst({
      where: {
        key: activity_type_key,
        workspace_id,
      },
    });

    if (!activityType) return null;

    const activity = await prisma.activity.create({
      data: {
        activity_type_id: activityType.id,
        message,
        member_id,
        source: "MANUAL",
        workspace_id,
      },
    });

    return ActivitySchema.parse(activity);
  });

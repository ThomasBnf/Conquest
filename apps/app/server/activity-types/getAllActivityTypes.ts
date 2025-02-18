import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@conquest/db/prisma";
import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";

export const getAllActivityTypes = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const activityTypes = await prisma.activity_type.findMany({
      where: {
        workspace_id,
      },
      orderBy: {
        points: "desc",
      },
    });

    return ActivityTypeSchema.array().parse(activityTypes);
  },
);

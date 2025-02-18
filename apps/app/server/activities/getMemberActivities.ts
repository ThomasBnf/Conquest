import { prisma } from "@conquest/db/prisma";
import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getMemberActivities = protectedProcedure
  .input(
    z.object({
      memberId: z.string().nullable(),
      take: z.number().optional(),
      cursor: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { memberId, take, cursor } = input;

    if (!memberId) return [];

    const activities = await prisma.activity.findMany({
      where: {
        member_id: memberId,
        workspace_id,
      },
      include: {
        activity_type: true,
      },
      orderBy: {
        created_at: "desc",
      },
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      take,
    });

    return ActivityWithTypeSchema.array().parse(activities);
  });

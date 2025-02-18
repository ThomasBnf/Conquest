import { prisma } from "@conquest/db/prisma";
import { ActivityWithTypeSchema } from "@conquest/zod/schemas/activity.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getCompanyActivities = protectedProcedure
  .input(
    z.object({
      companyId: z.string(),
      cursor: z.string().nullish(),
      take: z.number(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { companyId, cursor, take } = input;

    const activities = await prisma.activity.findMany({
      where: {
        member: {
          company_id: companyId,
        },
        workspace_id,
      },
      include: {
        activity_type: true,
      },
      orderBy: {
        created_at: "desc",
      },
      skip: 1,
      cursor: cursor ? { id: cursor } : undefined,
      take,
    });

    return ActivityWithTypeSchema.array().parse(activities);
  });

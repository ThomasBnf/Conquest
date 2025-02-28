import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const topActivityTypes = protectedProcedure
  .input(
    z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { from, to } = input;
    const { workspace_id } = user;

    // const activities = await prisma.activity.findMany({
    //   where: {
    //     workspace_id,
    //     created_at: {
    //       gte: from,
    //       lte: to,
    //     },
    //   },
    //   include: {
    //     activity_type: true,
    //   },
    // });

    // const result = activities.reduce<
    //   Record<string, { type: string; count: number }>
    // >((acc, activity) => {
    //   const source = activity.activity_type?.source;
    //   const type = `${source?.slice(0, 1).toUpperCase()}${source?.slice(1).toLowerCase()} - ${activity.activity_type?.name}`;
    //   if (!type) return acc;

    //   if (!acc[type]) {
    //     acc[type] = {
    //       type,
    //       count: 0,
    //     };
    //   }
    //   acc[type].count += 1;
    //   return acc;
    // }, {});

    return {
      activityTypes: [],
    };
  });

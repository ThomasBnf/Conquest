import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const topMembers = protectedProcedure
  .input(
    z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { from, to } = input;
    const { workspace_id } = user;

    // const members = await prisma.member.findMany({
    //   where: {
    //     workspace_id,
    //     activities: {
    //       some: {
    //         created_at: {
    //           gte: from,
    //           lte: to,
    //         },
    //       },
    //     },
    //   },
    //   include: {
    //     activities: {
    //       where: {
    //         created_at: {
    //           gte: from,
    //           lte: to,
    //         },
    //       },
    //       include: {
    //         activity_type: true,
    //       },
    //     },
    //   },
    //   take: 10,
    // });

    // const topMembers = members
    //   .map((member) => ({
    //     ...member,
    //     // pulse: member.activities.reduce((acc, activity) => {
    //     //   return acc + activity.activity_type.conditions;
    //     // }, 0),
    //   }))
    //   .sort((a, b) => b.pulse - a.pulse)
    //   .filter((member) => member.pulse > 0);

    return {
      topMembers: [],
    };
  });

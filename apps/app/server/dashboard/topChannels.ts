import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const topChannels = protectedProcedure
  .input(
    z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { from, to } = input;
    const { workspace_id } = user;

    // const channels = await prisma.channel.findMany({
    //   where: {
    //     workspace_id,
    //   },
    //   include: {
    //     _count: {
    //       select: {
    //         activities: {
    //           where: {
    //             created_at: {
    //               gte: from,
    //               lte: to,
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    //   take: 10,
    // });

    // const sortedChannels = channels.sort(
    //   (a, b) => b._count.activities - a._count.activities,
    // );

    return {
      channels: [],
    };
  });

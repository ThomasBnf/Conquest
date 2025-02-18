import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteTag = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id } = input;

    const members = await prisma.member.findMany({
      where: {
        tags: {
          has: id,
        },
      },
    });

    await Promise.all(
      members.map((member) => {
        const filteredTags = member.tags.filter((tag) => tag !== id);

        return prisma.member.update({
          where: {
            id: member.id,
          },
          data: {
            tags: { set: filteredTags },
          },
        });
      }),
    );

    return await prisma.tag.delete({
      where: {
        id,
        workspace_id,
      },
    });
  });

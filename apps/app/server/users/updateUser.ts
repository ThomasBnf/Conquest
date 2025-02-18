import { prisma } from "@conquest/db/prisma";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateUser = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
      data: UserSchema.partial(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id, data } = input;

    await prisma.user.update({
      where: {
        id,
      },
      data,
    });
  });

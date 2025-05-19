import { prisma } from "@conquest/db/prisma";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getUser = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { id } = input;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return UserSchema.parse(user);
  });

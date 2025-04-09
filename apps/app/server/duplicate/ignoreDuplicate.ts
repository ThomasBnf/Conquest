import { prisma } from "@conquest/db/prisma";
import { DuplicateSchema } from "@conquest/zod/schemas/duplicate.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const ignoreDuplicate = protectedProcedure
  .input(
    z.object({
      duplicate: DuplicateSchema,
    }),
  )
  .mutation(async ({ input }) => {
    const { id } = input.duplicate;

    return await prisma.duplicate.update({
      where: {
        id,
      },
      data: {
        state: "REJECTED",
      },
    });
  });

import { FormEditSchema } from "@/features/lists/schemas/form-edit.schema";
import { prisma } from "@conquest/db/prisma";
import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { protectedProcedure } from "../trpc";

export const updateList = protectedProcedure
  .input(FormEditSchema)
  .mutation(async ({ input }) => {
    const { id, ...data } = input;

    const list = await prisma.list.update({
      where: {
        id,
      },
      data,
    });

    return ListSchema.parse(list);
  });

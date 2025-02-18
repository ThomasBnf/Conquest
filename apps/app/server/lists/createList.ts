import { FormListSchema } from "@/features/lists/schemas/form-create.schema";
import { prisma } from "@conquest/db/prisma";
import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { protectedProcedure } from "../trpc";

export const createList = protectedProcedure
  .input(FormListSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;

    const list = await prisma.list.create({
      data: {
        ...input,
        workspace_id,
      },
    });

    return ListSchema.parse(list);
  });

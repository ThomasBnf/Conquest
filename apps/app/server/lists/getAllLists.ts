import { prisma } from "@conquest/db/prisma";
import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { protectedProcedure } from "../trpc";

export const getAllLists = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const list = await prisma.list.findMany({
      where: {
        workspace_id,
      },
    });

    return ListSchema.array().parse(list);
  },
);

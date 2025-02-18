import { prisma } from "@conquest/db/prisma";
import { ListSchema } from "@conquest/zod/schemas/list.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getList = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id } = input;

    const list = await prisma.list.findUnique({
      where: {
        id,
        workspace_id,
      },
    });

    return ListSchema.parse(list);
  });

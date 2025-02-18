import { prisma } from "@conquest/db/prisma";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";
import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";

export const updateWorkspace = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid(),
      data: WorkspaceSchema.partial(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id, data } = input;

    await prisma.workspace.update({
      where: {
        id,
      },
      data,
    });
  });

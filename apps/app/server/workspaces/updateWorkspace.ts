import { prisma } from "@conquest/db/prisma";
import { updateWorkspace as _updateWorkspace } from "@conquest/db/workspaces/updateWorkspace";
import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateWorkspace = protectedProcedure
  .input(
    z
      .object({
        id: z.string(),
      })
      .and(WorkspaceSchema.partial()),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { slug } = input;

    if (slug) {
      const slugTaken = await prisma.workspace.findFirst({
        where: {
          slug,
          id: { not: user.workspace_id },
        },
      });

      if (slugTaken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `The slug "${slug}" is already taken`,
        });
      }
    }

    await _updateWorkspace(input);
  });

import { updateWorkspace as _updateWorkspace } from "@conquest/db/workspaces/updateWorkspace";
import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
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
  .mutation(async ({ input }) => {
    await _updateWorkspace(input);
  });

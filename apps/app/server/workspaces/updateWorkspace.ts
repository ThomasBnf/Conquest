import { updateWorkspace as _updateWorkspace } from "@conquest/clickhouse/workspaces/updateWorkspace";
import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateWorkspace = protectedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
      data: WorkspaceSchema.partial(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id, data } = input;
    await _updateWorkspace({ id, data });
  });

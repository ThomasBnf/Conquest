import { getWorkspace as _getWorkspace } from "@conquest/db/workspaces/getWorkspace";
import { protectedProcedure } from "../trpc";

export const getWorkspace = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;
    return await _getWorkspace({ id: workspaceId });
  },
);

import { getWorkspace as _getWorkspace } from "@conquest/clickhouse/workspaces/getWorkspace";
import { protectedProcedure } from "../trpc";

export const getWorkspace = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;
    return await _getWorkspace({ id: workspace_id });
  },
);

import { listLevels as _listLevels } from "@conquest/clickhouse/levels/listLevels";
import { protectedProcedure } from "../trpc";

export const listLevels = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    return await _listLevels({ workspaceId });
  },
);

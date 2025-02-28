import { listLevels as _listLevels } from "@conquest/clickhouse/levels/listLevels";
import { protectedProcedure } from "../trpc";

export const listLevels = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    return await _listLevels({ workspace_id });
  },
);

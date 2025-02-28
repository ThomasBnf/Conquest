import { protectedProcedure } from "@/server/trpc";
import { listApiKeys as _listApiKeys } from "@conquest/clickhouse/api-keys/listApiKeys";

export const listApiKeys = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    return await _listApiKeys({ workspace_id });
  },
);

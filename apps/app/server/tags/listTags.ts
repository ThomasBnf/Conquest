import { listTags as _listTags } from "@conquest/clickhouse/tags/listTags";
import { protectedProcedure } from "../trpc";

export const listTags = protectedProcedure.query(async ({ ctx: { user } }) => {
  const { workspace_id } = user;

  return await _listTags({ workspace_id });
});

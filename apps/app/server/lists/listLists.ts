import { listLists as _listLists } from "@conquest/db/lists/listLists";
import { protectedProcedure } from "../trpc";

export const listLists = protectedProcedure.query(async ({ ctx: { user } }) => {
  const { workspace_id } = user;

  return _listLists({ workspace_id });
});

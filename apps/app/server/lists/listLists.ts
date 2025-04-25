import { listLists as _listLists } from "@conquest/db/lists/listLists";
import { protectedProcedure } from "../trpc";

export const listLists = protectedProcedure.query(async ({ ctx: { user } }) => {
  const { id, workspaceId } = user;

  return _listLists({ userId: id, workspaceId });
});

import { listLists as _listLists } from "@conquest/db/lists/listLists";
import { protectedProcedure } from "../trpc";

export const listLists = protectedProcedure.query(async ({ ctx: { user } }) => {
  const { id } = user;

  return _listLists({ user_id: id });
});

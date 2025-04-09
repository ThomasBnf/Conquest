import { listDuplicates as _listDuplicates } from "@conquest/db/duplicates/listDuplicates";
import { protectedProcedure } from "../trpc";

export const listDuplicate = protectedProcedure.query(async ({ ctx }) => {
  const { workspace_id } = ctx.user;

  return _listDuplicates({ workspace_id });
});

import { countDuplicates as _countDuplicates } from "@conquest/db/duplicates/countDuplicates";
import { protectedProcedure } from "../trpc";

export const countDuplicates = protectedProcedure.query(async ({ ctx }) => {
  const { workspace_id } = ctx.user;

  return _countDuplicates({ workspace_id });
});

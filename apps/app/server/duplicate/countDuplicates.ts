import { countDuplicates as _countDuplicates } from "@conquest/db/duplicates/countDuplicates";
import { protectedProcedure } from "../trpc";

export const countDuplicates = protectedProcedure.query(async ({ ctx }) => {
  const { workspaceId } = ctx.user;

  return _countDuplicates({ workspaceId });
});

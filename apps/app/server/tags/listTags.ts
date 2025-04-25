import { listTags as _listTags } from "@conquest/db/tags/listTags";
import { protectedProcedure } from "../trpc";

export const listTags = protectedProcedure.query(async ({ ctx: { user } }) => {
  const { workspaceId } = user;

  return await _listTags({ workspaceId });
});

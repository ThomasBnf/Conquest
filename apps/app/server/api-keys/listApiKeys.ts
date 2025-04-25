import { protectedProcedure } from "@/server/trpc";
import { listApiKeys as _listApiKeys } from "@conquest/db/api-keys/listApiKeys";

export const listApiKeys = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    return await _listApiKeys({ workspaceId });
  },
);

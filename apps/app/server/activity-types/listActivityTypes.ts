import { protectedProcedure } from "@/server/trpc";
import { listActivityTypes as _listActivityTypes } from "@conquest/db/activity-type/listActivityTypes";

export const listActivityTypes = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    return await _listActivityTypes({ workspaceId });
  },
);

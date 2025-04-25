import { listIntegrations as _listIntegrations } from "@conquest/db/integrations/listIntegrations";
import { protectedProcedure } from "../trpc";

export const listIntegrations = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    return await _listIntegrations({ workspaceId });
  },
);

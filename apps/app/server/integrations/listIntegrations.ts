import { listIntegrations as _listIntegrations } from "@conquest/db/integrations/listIntegrations";
import { protectedProcedure } from "../trpc";

export const listIntegrations = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    return await _listIntegrations({ workspace_id });
  },
);

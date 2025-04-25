import { getIntegrationBySource as _getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getIntegrationBySource = protectedProcedure
  .input(
    z.object({
      source: SOURCE,
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { source } = input;

    return await _getIntegrationBySource({
      source,
      workspaceId,
    });
  });

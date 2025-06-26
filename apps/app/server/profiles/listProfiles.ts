import { listProfiles as _listProfiles } from "@conquest/db/profile/listProfiles";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listProfiles = protectedProcedure
  .input(
    z.object({
      memberId: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { memberId } = input;

    return await _listProfiles({ memberId, workspaceId });
  });

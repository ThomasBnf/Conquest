import { listActivities as _listActivities } from "@conquest/db/activity/listActivities";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const listActivities = protectedProcedure
  .input(
    z.object({
      memberId: z.string().optional(),
      companyId: z.string().optional(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { memberId, companyId } = input;

    return await _listActivities({
      memberId,
      companyId,
      workspaceId,
    });
  });

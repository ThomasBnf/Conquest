import { getActivity as _getActivity } from "@conquest/db/activity/getActivity";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getActivity = protectedProcedure
  .input(
    z.object({
      externalId: z.string().nullable(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { externalId } = input;

    if (!externalId) return null;

    return await _getActivity({ externalId, workspaceId });
  });

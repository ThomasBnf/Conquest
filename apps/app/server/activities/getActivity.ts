import { getActivity as _getActivity } from "@conquest/clickhouse/activities/getActivity";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getActivity = protectedProcedure
  .input(
    z.object({
      external_id: z.string().nullable(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { external_id } = input;

    if (!external_id) return null;

    return await _getActivity({ external_id, workspace_id });
  });

import { deleteProfile as _deleteProfile } from "@conquest/clickhouse/profile/deleteProfile";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteProfile = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id } = input;

    return await _deleteProfile({ id });
  });

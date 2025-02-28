import { updateProfile as _updateProfile } from "@conquest/clickhouse/profiles/updateProfile";
import { ProfileAttributesSchema } from "@conquest/zod/schemas/profile.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateProfile = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      attributes: ProfileAttributesSchema,
    }),
  )
  .mutation(async ({ input }) => {
    const { id, attributes } = input;

    return await _updateProfile({ id, attributes });
  });

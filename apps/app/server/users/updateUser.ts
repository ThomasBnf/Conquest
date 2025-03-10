import { updateUser as _updateUser } from "@conquest/db/users/updateUser";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateUser = protectedProcedure
  .input(
    z
      .object({
        id: z.string(),
      })
      .and(UserSchema.partial()),
  )
  .mutation(async ({ input }) => {
    await _updateUser(input);
  });

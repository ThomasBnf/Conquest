import { updateUser as _updateUser } from "@conquest/clickhouse/users/updateUser";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateUser = protectedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
      data: UserSchema.partial(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id, data } = input;

    await _updateUser({ id, data });
  });

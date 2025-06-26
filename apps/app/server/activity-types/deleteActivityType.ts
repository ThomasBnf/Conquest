import { deleteActivityType as _deleteActivityType } from "@conquest/db/activity-type/deleteActivityType";

import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteActivityType = protectedProcedure
  .input(
    z.object({
      key: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { key } = input;

    await _deleteActivityType({ key, workspaceId });
  });

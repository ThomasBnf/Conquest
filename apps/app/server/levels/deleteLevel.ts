import { deleteLevel as _deleteLevel } from "@conquest/db/level/deleteLevel";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteLevel = protectedProcedure
  .input(
    z.object({
      number: z.number(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { number } = input;

    return _deleteLevel({ number, workspaceId });
  });

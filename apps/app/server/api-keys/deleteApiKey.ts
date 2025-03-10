import { deleteApiKey as _deleteApiKey } from "@conquest/db/api-keys/deleteApiKey";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteApiKey = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id } = input;

    return await _deleteApiKey({ id });
  });

import { deleteTag as _deleteTag } from "@conquest/db/tags/deleteTag";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteTag = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id } = input;

    return _deleteTag({ id });
  });

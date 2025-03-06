import { updateTag as _updateTag } from "@conquest/db/tags/updateTag";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateTag = protectedProcedure
  .input(
    z
      .object({
        id: z.string(),
      })
      .and(TagSchema.partial()),
  )
  .mutation(async ({ input }) => {
    return _updateTag(input);
  });

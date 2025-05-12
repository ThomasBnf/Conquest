import { createTag as _createTag } from "@conquest/db/tags/createTag";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { protectedProcedure } from "../trpc";

export const createTag = protectedProcedure
  .input(TagSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;

    return await _createTag({
      ...input,
      workspaceId,
    });
  });

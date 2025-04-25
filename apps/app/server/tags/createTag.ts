import { FormTagSchema } from "@/features/tags/schema/form.schema";
import { createTag as _createTag } from "@conquest/db/tags/createTag";
import { protectedProcedure } from "../trpc";

export const createTag = protectedProcedure
  .input(FormTagSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { name, color } = input;

    return await _createTag({
      name,
      color,
      source: "Manual",
      workspaceId,
    });
  });

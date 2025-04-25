import { FormListSchema } from "@/features/lists/schemas/form-create.schema";
import { createList as _createList } from "@conquest/db/lists/createList";
import { protectedProcedure } from "../trpc";

export const createList = protectedProcedure
  .input(FormListSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { id, workspaceId } = user;

    return _createList({ ...input, createdBy: id, workspaceId });
  });

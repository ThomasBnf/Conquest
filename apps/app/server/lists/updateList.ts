import { FormEditSchema } from "@/features/lists/schemas/form-edit.schema";
import { updateList as _updateList } from "@conquest/db/lists/updateList";
import { protectedProcedure } from "../trpc";

export const updateList = protectedProcedure
  .input(FormEditSchema)
  .mutation(async ({ input }) => {
    const { id, ...data } = input;

    return _updateList({ id, ...data });
  });

import { protectedProcedure } from "@/server/trpc";
import { createField as _createField } from "@conquest/db/custom-fields/createField";
import { CustomFieldSchema } from "@conquest/zod/schemas/custom-field.schema";

export const createField = protectedProcedure
  .input(CustomFieldSchema)
  .mutation(async ({ input }) => {
    return await _createField(input);
  });

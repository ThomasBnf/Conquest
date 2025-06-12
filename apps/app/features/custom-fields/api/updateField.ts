import { protectedProcedure } from "@/server/trpc";
import { updateField as _updateField } from "@conquest/db/custom-fields/updateField";
import { CustomFieldSchema } from "@conquest/zod/schemas/custom-field.schema";

export const updateField = protectedProcedure
  .input(CustomFieldSchema)
  .mutation(async ({ input }) => {
    return await _updateField(input);
  });

import { GroupFiltersSchema } from "@conquest/zod/schemas/filters.schema";
import { z } from "zod";

export const FormListSchema = z.object({
  emoji: z.string(),
  name: z.string().min(1),
  groupFilters: GroupFiltersSchema,
});

export type FormList = z.infer<typeof FormListSchema>;

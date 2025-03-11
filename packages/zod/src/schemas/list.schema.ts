import { z } from "zod";
import { GroupFiltersSchema } from "./filters.schema";

export const ListSchema = z.object({
  id: z.string().uuid(),
  emoji: z.string(),
  name: z.string(),
  groupFilters: GroupFiltersSchema,
  created_by: z.string(),
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type List = z.infer<typeof ListSchema>;

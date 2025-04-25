import { z } from "zod";
import { GroupFiltersSchema } from "./filters.schema";

export const ListSchema = z.object({
  id: z.string().uuid(),
  emoji: z.string(),
  name: z.string(),
  groupFilters: GroupFiltersSchema,
  createdBy: z.string(),
  workspaceId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type List = z.infer<typeof ListSchema>;

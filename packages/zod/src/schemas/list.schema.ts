import type { list } from "@prisma/client";
import { z } from "zod";
import { GroupFiltersSchema } from "./filters.schema";

export const ListSchema = z.object({
  id: z.string().cuid(),
  emoji: z.string(),
  name: z.string(),
  groupFilters: GroupFiltersSchema,
  workspace_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
}) satisfies z.ZodType<list>;

export type List = z.infer<typeof ListSchema>;

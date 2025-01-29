import type { lists } from "@prisma/client";
import { z } from "zod";
import { FilterSchema } from "./filters.schema";

export const ListSchema = z.object({
  id: z.string().cuid(),
  emoji: z.string(),
  name: z.string(),
  filters: z.array(FilterSchema),
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}) satisfies z.ZodType<lists>;

export type List = z.infer<typeof ListSchema>;

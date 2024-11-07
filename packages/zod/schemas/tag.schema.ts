import { z } from "zod";
import { SOURCE } from "./source.enum";

export const TagSchema = z.object({
  id: z.string().cuid(),
  external_id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string(),
  source: SOURCE,
  workspace_id: z.string().cuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Tag = z.infer<typeof TagSchema>;

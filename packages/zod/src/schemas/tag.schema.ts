import { z } from "zod";
import { SOURCE } from "../enum/source.enum";

export const TagSchema = z.object({
  id: z.string().uuid(),
  external_id: z.string(),
  name: z.string(),
  color: z.string(),
  source: SOURCE,
  workspace_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Tag = z.infer<typeof TagSchema>;

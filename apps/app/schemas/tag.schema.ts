import { z } from "zod";

export const TagSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  color: z.string(),
  workspace_id: z.string().cuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Tag = z.infer<typeof TagSchema>;

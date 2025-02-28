import { z } from "zod";

export const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  source: z.string(),
  company_size: z.string(),
  plan: z.string().default("BASIC"),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
